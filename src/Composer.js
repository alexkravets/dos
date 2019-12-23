'use strict'

const path            = require('path')
const uniq            = require('lodash.uniq')
const Schema          = require('./Schema')
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
    const isNoSchemas = schemas.length === 0

    if (isNoSchemas) { return validator }

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

  static validate(validator, schemaId, jsonSchema, object) {
    const isValid = validator.validate(object, { id: schemaId, ...jsonSchema })

    if (isValid) { return true }

    const validationErrors = validator.getLastErrors()
    throw new ValidationError(schemaId, object, validationErrors)
  }

  constructor(path, { components, operations, config }) {
    this._config     = config     || {}
    this._components = components || []
    this._operations = operations || []

    this._components.push(OperationError)

    const operationComponents = compact(this._operations.map(({ Component }) => Component))
    this._components = uniq([ ...this._components, ...operationComponents ])

    this._schemas   = path ? Composer.loadSchemas(path) : []
    this._validator = Composer.validateSchemas(this._schemas, 'Schemas')

    this._includeComponentSchemas()
    this._includeOperationSchemas()
    this._validateComponentActionMethods()
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
    if (this._operations.length === 0) { return }

    for (const operationClass of this._operations) {
      let { mutationSchema, inputSchema, outputSchema } = operationClass

      if (inputSchema) {
        this._schemas[inputSchema.id] = inputSchema
      }

      if (mutationSchema) {
        this._schemas[mutationSchema.id] = mutationSchema
      }

      if (outputSchema) {
        this._schemas[outputSchema.id] = outputSchema
      }
    }

    this._validator = Composer.validateSchemas(this._schemas, 'Operations')
  }

  _validateComponentActionMethods() {
    for (const Operation of this._operations) {
      const { Component, componentAction } = Operation

      if (!Component) { continue }

      /* istanbul ignore next: No sense to override this with null, as it might
         make more sense to override action, but keeping this check here just in
         case */
      if (!componentAction) { continue }

      try {
        Operation.componentActionMethod

      } catch (error) {
        throw new Error(`Operation "${Operation.id}" expects component` +
          ` action method "${Component.name}.${componentAction}(context, ...)"` +
          ' to be defined')

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

  validate(schemaId, object) {
    const schema = this.schemas[schemaId]
    if (!schema) { throw new Error(`${schemaId} schema is not registered`) }

    const { jsonSchema } = schema
    Composer.validate(this._validator, schemaId, jsonSchema, object)
  }

  validateInput(schemaId, object) {
    const schema = this.schemas[schemaId]

    schema.cleanup(object, this.schemas)
    schema.populateValueTypes(object, this.schemas)
    schema.populateDefaultValues(object, this.schemas)

    this.validate(schemaId, object)

    return object
  }

  validateOutput(schemaId, object) {
    const schema = this.schemas[schemaId]

    schema.cleanup(object, this.schemas)

    this.validate(schemaId, object)

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
        description,
        outputSchema,
        mutationSchema,
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

      if (mutationSchema) {
        parameters.push({
          in:       'body',
          name:     'mutation',
          schema:   { $ref: mutationSchema.id },
          required: true
        })
      }

      if (parameters.length > 0) {
        spec.paths[path][method].parameters = parameters
      }

      const successStatusCode = (() => {
        if (!outputSchema) { return '204' }
        if (type === 'create') { return '201' }
        return '200'
      })()

      const success = { description: 'Success' }
      if (outputSchema) {
        success.schema = { $ref: outputSchema.id }
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

        if (statusCode !== '500') {
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

  validateSpec() {
    const schemaPath = path.resolve(__dirname, '../assets/schemas/v2.0/schema.json')
    const jsonSchema = require(schemaPath)

    const validator = new ZSchema({ ignoreUnknownFormats: true })
    Composer.validate(validator, 'Spec', jsonSchema, this.spec)
  }
}

module.exports = Composer
