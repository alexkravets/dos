'use strict'

const pick      = require('lodash.pick')
const unset     = require('lodash.unset')
const cloneDeep = require('lodash.clonedeep')
const Promise = require('bluebird')
const ZSchema = require('z-schema')
const isUndefined     = require('lodash.isundefined')
const ValidationError = require('./errors/ValidationError')

class Schema {
  static _normalizeType(type, value) {
    let normalizedValue = value

    const isNumber  = type === 'integer' || type === 'number'
    const isBoolean = type === 'boolean'

    if (isNumber) {
      normalizedValue = Number(value) || value
    }

    if (isBoolean) {
      const isBoolean = typeof value === 'boolean'
      const isNumber  = typeof value === 'number'

      if (!isBoolean) {
        if (isNumber) {
          normalizedValue = Boolean(value)

        } else {
          const isTrue = value.toLowerCase() === 'true' || value === '1'
          normalizedValue = isTrue ? true : false

        }
      }
    }

    return normalizedValue
  }

  static _removeRequiredAndDefaultFromJsonSchema(jsonSchema) {
    const { properties } = jsonSchema
    if (!properties) { return }

    for (const name in properties) {
      const property = properties[name]
      delete property.required
      delete property.default

      const isObject = property.type === 'object'
      const isArray  = property.type === 'array'

      if (isObject) {
        Schema._removeRequiredAndDefaultFromJsonSchema(property)
      }

      if (isArray) {
        const { items: itemsJsonSchema } = property
        Schema._removeRequiredAndDefaultFromJsonSchema(itemsJsonSchema)
      }
    }

    return { properties }
  }

  static _normalizeRequiredFields(jsonSchema) {
    const { properties } = jsonSchema

    if (!properties) { return }

    const required = []
    for (const name in properties) {
      const property = properties[name]

      if (property.required) {
        required.push(name)
      }

      delete properties[name].required

      const isObject = property.type === 'object'
      const isArray  = property.type === 'array'

      if (isObject) {
        Schema._normalizeRequiredFields(property)
      }

      if (isArray) {
        const { items: itemsJsonSchema } = property
        Schema._normalizeRequiredFields(itemsJsonSchema)
      }
    }

    if (required.length > 0) {
      jsonSchema.required = required
    }
  }

  constructor(schemaId, source) {
    this._id     = schemaId
    this._source = source
  }

  get id() {
    return this._id
  }

  get source() {
    return this._source
  }

  get enum() {
    return this.source.enum
  }

  get isEnum() {
    return !!this.source.enum
  }

  get jsonSchema() {
    if (this.isEnum) {
      return cloneDeep(this.source)
    }

    const jsonSchema = {
      type:       'object',
      properties: cloneDeep(this.source)
    }

    Schema._normalizeRequiredFields(jsonSchema)
    return jsonSchema
  }

  clone(schemaId, options = {}) {
    let source = cloneDeep(this.source)

    if (this.isEnum) {
      options = {}
    }

    if (options.only) {
      source = pick(source, options.only)
    }

    if (options.skip) {
      for (let path of options.skip) {
        path = path.replace('.', '.properties.')
        unset(source, path)
      }
    }

    if (options.isUpdate) {
      const jsonSchema = { properties: source }
      const { properties } = Schema._removeRequiredAndDefaultFromJsonSchema(jsonSchema)
      source = properties
    }

    if (options.extend) {
      source = { ...source, ...options.extend }
    }

    return new Schema(schemaId, source)
  }

  cleanup(object, schemas = {}) {
    if (this.isEnum) { return }

    const { jsonSchema } = this

    for (const fieldName in object) {
      const isFieldDefined = !!jsonSchema.properties[fieldName]

      if (isFieldDefined) {
        const { $ref: refSchemaId, properties, type } = jsonSchema.properties[fieldName]
        const isReference = !!refSchemaId
        const isNested    = !!properties
        const isArray     = type === 'array'

        if (isReference) {
          const refSchema = schemas[refSchemaId]

          if (!refSchema) {
            throw new Error(`Schema ${this.id} is referensing missing schema` +
              ` ${refSchemaId}`)
          }

          refSchema.cleanup(object[fieldName], schemas)

        } else if (isNested) {
          const nestedSchema = new Schema(`${this.id}.${fieldName}`, properties)
          nestedSchema.cleanup(object[fieldName], schemas)

        } else if (isArray) {
          const { $ref: itemRefSchemaId, properties: itemProperties } = jsonSchema.properties[fieldName].items
          const array = object[fieldName]
          const isItemObject    = !!itemProperties
          const isItemReference = !!itemRefSchemaId

          let itemSchema
          if (isItemReference) {
            itemSchema = schemas[itemRefSchemaId]

            if (!itemSchema) {
              throw new Error(`Schema ${this.id}.${fieldName} is referensing` +
                ` missing schema ${itemRefSchemaId}`)
            }

          } else if (isItemObject) {
            itemSchema = new Schema(`${this.id}.${fieldName}.item`, itemProperties)

          }

          if (itemSchema) {
            for (const item of array) {
              itemSchema.cleanup(item, schemas)
            }
          }
        }

      } else {
        delete object[fieldName]

      }
    }
  }

  populateValueTypes(object, schemas = {}) {
    this._mapObject(object, schemas, (propertyKey, propertySchema, object) => {
      const { type } = propertySchema
      const isValueDefined = !isUndefined(object[propertyKey])

      if (type && isValueDefined) {
        object[propertyKey] = Schema._normalizeType(type, object[propertyKey])
      }
    })

    // if (this.isEnum) { return }

    // const { jsonSchema } = this

    // for (const fieldName in object) {
    //   const value = object[fieldName]
    //   const { type, $ref: refSchemaId } = jsonSchema.properties[fieldName]

    //   if (type) {
    //     object[fieldName] = Schema._normalizeType(type, value)
    //   }

    //   if (refSchemaId) {
    //     const refSchema = schemas[refSchemaId]

    //     if (!refSchema) {
    //       throw new Error(`Schema ${this.id} is referensing missing schema` +
    //         ` ${refSchemaId}`)
    //     }

    //     refSchema.populateValueTypes(value, schemas)
    //   }
    // }
  }

  _mapObject(object, schemas, callback) {
    if (this.isEnum) { return }

    const { jsonSchema } = this

    for (const propertyKey in jsonSchema.properties) {
      const propertySchema = jsonSchema.properties[propertyKey]

      callback(propertyKey, propertySchema, object)

      const { $ref: refSchemaId, properties, items } = propertySchema

      const value          = object[propertyKey]
      const isArray        = propertySchema.type === 'array'
      const isObject       = propertySchema.type === 'object'
      const isReference    = !isUndefined(refSchemaId)
      const isValueDefined = !isUndefined(value)

      if (isValueDefined) {
        if (isReference) {
          const refSchema = schemas[refSchemaId]

          if (!refSchema) {
            throw new Error(`"${this.id}.${propertyKey}.$ref" is` +
              ` referensing missing schema "${refSchemaId}"`)
          }

          refSchema._mapObject(value, schemas, callback)

        } else if (isObject) {
          if (properties) {
            const objectSchema = new Schema(`${this.id}.${propertyKey}.properties`, properties)
            objectSchema._mapObject(value, schemas, callback)
          }

        } else if (isArray) {
          const itemRefSchemaId = items.$ref

          let itemSchema

          if (itemRefSchemaId) {
            itemSchema = schemas[itemRefSchemaId]

            if (!itemSchema) {
              throw new Error(`"${this.id}.${propertyKey}.items.$ref" is` +
                ` referensing missing schema "${itemRefSchemaId}"`)
            }

          } else {
            const itemProperties  = items.properties
            itemSchema = new Schema(`${this.id}.${propertyKey}.items.properties`, itemProperties)

          }

          for (const valueItem of value) {
            itemSchema._mapObject(valueItem, schemas, callback)
          }
        }
      }
    }
  }

  populateDefaultValues(object, schemas = {}) {
    this._mapObject(object, schemas, (propertyKey, propertySchema, object) => {
      const value = object[propertyKey]
      const { default: defaultValue } = propertySchema

      const hasDefaultValue  = !isUndefined(defaultValue)
      const isValueUndefined = isUndefined(value)

      if (isValueUndefined && hasDefaultValue) {
        object[propertyKey] = defaultValue
      }
    })
  }

  _validate(validator, object, jsonSchema) {
    return new Promise((resolve, reject) =>
      validator.validate(object, jsonSchema, (errors, isValid) => {
        if (!isValid) { return reject(errors) }
        return resolve(true)
      })
    )
  }

  async validate(object, schemas = {}) {
    const validator = new ZSchema({ ignoreUnknownFormats: true })

    schemas[this.id] = this.jsonSchema
    schemas = Object.keys(schemas).map(id => ({ id, ...schemas[id] }))
    validator.validateSchema(schemas)

    const jsonSchema = { id: this.id, ...this.jsonSchema }
    try {
      await this._validate(validator, object, jsonSchema)

    } catch (validationErrors) {
      throw new ValidationError(this.id, object, validationErrors)

    }
  }
}

module.exports = Schema
