'use strict'

const path            = require('path')
const uniq            = require('lodash.uniq')
const Schema          = require('./Schema')
const Promise         = require('bluebird')
const ZSchema         = require('z-schema')
const compact         = require('lodash.compact')
const endsWith        = require('lodash.endswith')
const cloneDeep       = require('lodash.clonedeep')
const { safeLoad }    = require('js-yaml')
const OperationError  = require('./OperationError')
const ValidationError = require('./errors/ValidationError')
const { readdirSync, readFileSync, existsSync } = require('fs')

class Composer {
  static loadSchemas(path) {
    const isPathValid = !existsSync(path)

    if (isPathValid) {
      throw new Error(`Can't find schemas at: ${path}`)
    }

    const fileNames = readdirSync(path).filter(name => endsWith(name, '.yaml'))
    const result = {}

    for (const fileName of fileNames) {
      const schemaId     = fileName.replace('.yaml', '')
      const schemaSource = safeLoad(readFileSync(`${path}/${fileName}`))
      result[schemaId] = new Schema(schemaId, schemaSource)
    }

    return result
  }

  static validateSchemas(schemas, scope) {
    const jsonSchemas = Composer.jsonSchemas(schemas)

    const validator = new ZSchema({ ignoreUnknownFormats: true })
    const isValid = validator.validateSchema(jsonSchemas)

    if (isValid) { return validator }

    const json = JSON.stringify(validator.lastReport.errors, null, 2)
    throw new Error(`${scope} validation error:\n${json}`)
  }

  static jsonSchemas(schemas) {
    const result = []

    for (const schemaId in schemas) {
      const schema = schemas[schemaId]
      if (!schema) {
        throw new Error(`Schema \`${schemaId}\` is not defined`)
      }

      const { jsonSchema } = schema
      if (!jsonSchema) {
        throw new Error(`Schema \`${schemaId}\` is not a valid Schema instance`)
      }

      jsonSchema.id = schemaId
      result.push(jsonSchema)
    }

    return result
  }

  static validate(validator, object, jsonSchema) {
    return new Promise((resolve, reject) =>
      validator.validate(object, jsonSchema, (errors, isValid) => {
        if (!isValid) { return reject(errors) }
        return resolve(true)
      })
    )
  }

  constructor(path, { components, operations, config }) {
    this._config     = config     || {}
    this._components = components || []
    this._operations = operations || []

    this._components.push(OperationError)

    const resources  = compact(this._operations.map(operation => operation.resource))
    this._components = uniq([ ...this._components, ...resources ])

    this._schemas   = Composer.loadSchemas(path)
    this._validator = Composer.validateSchemas(this._schemas, 'Schemas')

    this._includeComponentSchemas()
    this._includeOperationSchemas()
    this._validateResourceActionMethods()
  }

  _includeComponentSchemas() {
    for (const componentClass of this._components) {
      const schema   = componentClass.createSchema(this.schemas)
      const schemaId = componentClass.id

      this._schemas[schemaId] = schema
    }

    this._validator = Composer.validateSchemas(this._schemas, 'Components')
  }

  _includeOperationSchemas() {
    if (this._operations.length == 0) { return }

    for (const operationClass of this._operations) {
      let { mutation, inputSchema, outputSchema } = operationClass

      if (inputSchema) {
        this._schemas[inputSchema.id] = inputSchema
      }

      if (mutation) {
        this._schemas[mutation.id] = mutation
      }

      if (outputSchema) {
        this._schemas[outputSchema.id] = outputSchema
      }
    }

    this._validator = Composer.validateSchemas(this._schemas, 'Operations')
  }

  _validateResourceActionMethods() {
    for (const Operation of this._operations) {
      const { resource, resourceAction } = Operation
      if (resource && resourceAction) {
        try {
          Operation.resourceActionMethod

        } catch (error) {
          const resourceName = resource.name
          throw new Error(`Resource action \`${resourceAction}\` is not defined` +
            ` for resource \`${resourceName}\` while required by ${Operation.id}` +
            ' as resourceAction')

        }
      }
    }
  }

  get config() {
    return this._config
  }

  get schemas() {
    return this._schemas
  }

  get operations() {
    return this._operations
  }

  get components() {
    return this._components
  }

  _validate(object, jsonSchema) {
    return Composer.validate(this._validator, object, jsonSchema)
  }

  async validate(schemaId, object) {
    const schema = this.schemas[schemaId]
    if (!schema) { throw new Error(`${schemaId} schema is not registered`) }

    const { jsonSchema } = schema
    try {
      await this._validate(object, jsonSchema)

    } catch (validationErrors) {
      throw new ValidationError(schemaId, object, validationErrors)

    }
  }

  async validateInput(schemaId, object) {
    const schema = this.schemas[schemaId]

    schema.cleanup(object, this.schemas)
    schema.populateValueTypes(object, this.schemas)
    schema.populateDefaultValues(object, this.schemas)

    await this.validate(schemaId, object)
    return object
  }

  async validateOutput(schemaId, object) {
    const schema = this.schemas[schemaId]

    schema.cleanup(object, this.schemas)

    await this.validate(schemaId, object)
    return object
  }

  get spec() {
    if (this._spec) { return this._spec }

    const spec = {
      swagger: '2.0',
      ...this._config.spec,
      consumes: [ 'application/json' ],
      produces: [ 'application/json' ],
      tags: [],
      securityDefinitions: {},
      paths: {},
      definitions: {}
    }

    for (const schemaId in this.schemas) {
      const isNotInputSchema = !endsWith(schemaId, 'Input')

      if (isNotInputSchema) {
        const schema = this.schemas[schemaId]
        spec.definitions[schemaId] = schema.jsonSchema
      }
    }

    for (const Operation of this._operations) {
      const {
        id,
        path,
        tags,
        type,
        query,
        method,
        summary,
        mutation,
        description,
        outputSchema,
        errors,
        security
      } = Operation

      spec.paths[path] = {}
      spec.paths[path][method] = {
        operationId: id,
        summary,
        description,
        tags
      }

      const parameters = []
      for (const name in query) {
        parameters.push({ in: 'query', name, ...query[name] })
      }

      if (mutation) {
        parameters.push({
          in:       'body',
          name:     'mutation',
          schema:   { $ref: `${id}InputMutation` },
          required: true
        })
      }

      if (parameters.length > 0) {
        spec.paths[path][method].parameters = parameters
      }

      const successStatusCode = (() => {
        if (!outputSchema) { return '204' }
        if (type == 'create') { return '201' }
        return '200'
      })()

      const success = { description: 'Success' }
      if (outputSchema) {
        success.schema = { $ref: `${id}Output` }
      }

      const error = {
        description: 'Error',
        schema: { $ref: 'OperationError' }
      }

      const responses = {}
      responses[successStatusCode] = success
      responses['default'] = error

      const errorsMap = {}
      for (const errorCode in errors) {
        const { status } = errors[errorCode]
        const statusCode = Operation.statusCode(status)

        errorsMap[statusCode] = errorsMap[statusCode] || []
        errorsMap[statusCode].push(errorCode)
      }

      for (const statusCode in errorsMap) {
        const errorCodes  = errorsMap[statusCode]
        const description = errorCodes.join(', ')

        if (statusCode != 500) {
          responses[`${statusCode}`] = {
            description,
            schema: { $ref: 'OperationError' }
          }
        }
      }

      spec.paths[path][method].responses = responses

      if (security.length > 0) {
        const _security = cloneDeep(security)
        for (const requirements of _security) {
          for (const name in requirements) {
            const { definition } = requirements[name].klass
            spec.securityDefinitions = {
              ...spec.securityDefinitions,
              ...definition
            }

            requirements[name] = []
          }
        }

        spec.paths[path][method].security = _security
      }
    }

    const json = JSON
      .stringify(spec, null, 2)
      .replace(/"\$ref": "/g, '"$ref": "#/definitions/')

    this._spec = JSON.parse(json)
    return this._spec
  }

  async validateSpec() {
    const schemaPath = path.resolve(__dirname, '../assets/schemas/v2.0/schema.json')
    const jsonSchema = require(schemaPath)

    const validator = new ZSchema({ ignoreUnknownFormats: true })
    await Composer.validate(validator, this.spec, jsonSchema)
  }
}

module.exports = Composer
