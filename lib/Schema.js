'use strict'

const pick    = require('lodash.pick')
const clone   = require('lodash.clonedeep')
const Promise = require('bluebird')
const ZSchema = require('z-schema')
const isUndefined     = require('lodash.isundefined')
const ValidationError = require('./errors/ValidationError')

class Schema {
  static _removeRequiredAndDefaultFromJsonSchema(jsonSchema) {
    const { properties } = jsonSchema
    if (!properties) { return }

    for (const name in properties) {
      const property = properties[name]
      delete property.required
      delete property.default

      const isObject = property.type == 'object'
      const isArray  = property.type == 'array'

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

      const isObject = property.type == 'object'
      const isArray  = property.type == 'array'

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
      return clone(this.source)
    }

    const jsonSchema = {
      type:       'object',
      properties: clone(this.source)
    }

    Schema._normalizeRequiredFields(jsonSchema)
    return jsonSchema
  }

  clone(schemaId, options = {}) {
    let source

    if (this.isEnum) {
      options = {}
    }

    if (options.only) {
      source = pick(this.source, options.only)

    } else {
      source = clone(this.source)

    }

    if (options.skip) {
      for (const name of options.skip) {
        delete source[name]
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
        const { $ref: refSchemaId } = jsonSchema.properties[fieldName]
        const isReference = !!refSchemaId

        if (isReference) {
          const refSchema = schemas[refSchemaId]

          if (!refSchema) {
            throw new Error(`Schema ${this.id} is referensing missing schema` +
              ` ${refSchemaId}`)
          }

          refSchema.cleanup(object[fieldName], schemas)
        }
      } else {
        delete object[fieldName]

      }
    }
  }

  populateValueTypes(object, schemas = {}) {
    if (this.isEnum) { return }

    const { jsonSchema } = this

    for (const fieldName in object) {
      const value = object[fieldName]
      const { type, $ref: refSchemaId } = jsonSchema.properties[fieldName]

      if (type) {
        const isNumber  = type == 'integer' || type == 'number'
        const isBoolean = type == 'boolean'

        if (isNumber) {
          object[fieldName] = Number(value) || value
        }

        if (isBoolean) {
          const isBoolean = typeof value == 'boolean'
          const isNumber  = typeof value == 'number'

          if (!isBoolean) {
            if (isNumber) {
              object[fieldName] = Boolean(value)

            } else {
              const isTrue = value.toLowerCase() == 'true' || value == '1'
              object[fieldName] = isTrue ? true : false

            }
          }
        }
      }

      if (refSchemaId) {
        const refSchema = schemas[refSchemaId]

        if (!refSchema) {
          throw new Error(`Schema ${this.id} is referensing missing schema` +
            ` ${refSchemaId}`)
        }

        refSchema.populateValueTypes(value, schemas)
      }
    }
  }

  populateDefaultValues(object, schemas = {}) {
    if (this.isEnum) { return }

    const { jsonSchema } = this

    for (const fieldName in jsonSchema.properties) {
      const property = jsonSchema.properties[fieldName]
      const value    = object[fieldName]

      const { $ref: refSchemaId, default: defaultValue } = property

      const isReference      = !isUndefined(refSchemaId)
      const hasDefaultValue  = !isUndefined(defaultValue)
      const isValueDefined   = !isUndefined(value)
      const isValueUndefined = isUndefined(value)

      if (isValueUndefined && hasDefaultValue) {
        object[fieldName] = defaultValue
      }

      if (isValueDefined && isReference) {
        const refSchema = schemas[refSchemaId]

        if (!refSchema) {
          throw new Error(`Schema ${this.id} is referensing missing schema` +
            ` ${refSchemaId}`)
        }

        refSchema.populateDefaultValues(value, schemas)
      }
    }
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
