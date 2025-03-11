'use strict'

const handler = require('./helpers/handler')
const authorize = require('./helpers/authorize')
const createSpec = require('./helpers/createSpec')
const { Validator } = require('@kravc/schema')
const OperationError = require('./errors/OperationError')
const createSchemasMap = require('./helpers/createSchemasMap')
const InvalidInputError = require('./errors/InvalidInputError')
const InvalidOutputError = require('./errors/InvalidOutputError')
const OperationNotFoundError = require('./errors/OperationNotFoundError')
const { get, uniq, compact } = require('lodash')

const ROOT_PATH = process.cwd()
const DEFAULT_URL = 'http://localhost:3000/'
const DEFAULT_SERVICE_PATH = `${ROOT_PATH}/src`
const DEFAULT_SKIP_OPERATIONS = []

class Service {
  constructor(modules, options = {}) {
    let {
      url = DEFAULT_URL,
      path = DEFAULT_SERVICE_PATH,
      skipOperations = DEFAULT_SKIP_OPERATIONS,
    } = options

    if (!url.endsWith('/')) { url = url + '/' }

    const schemasMap = createSchemasMap(path)

    let components = modules.filter(Component => !Component.types)

    let operations = modules
      .filter(Component => !!Component.types)
      .filter(({ id }) => !skipOperations.includes(id))

    const operationComponents = compact(operations.map(({ Component }) => Component))
    components = uniq([ ...components, ...operationComponents ])

    for (const component of components) {
      if (!component.schema) {
        const schema = schemasMap[component.id]

        if (!schema) {
          throw new Error(`Schema for component "${component.id}" not found`)
        }

        component.schema = schema
      }

      schemasMap[component.id] = component.schema
    }

    const operationsMap = {}

    for (const operationClass of operations) {
      const { mutationSchema, inputSchema, outputSchema } = operationClass

      if (mutationSchema) {
        schemasMap[mutationSchema.id] = mutationSchema
      }

      if (inputSchema) {
        schemasMap[inputSchema.id] = inputSchema
      }

      if (outputSchema) {
        schemasMap[outputSchema.id] = outputSchema
      }

      operationsMap[operationClass.id] = operationClass
    }

    schemasMap[OperationError.id] = OperationError.schema

    const spec      = createSpec(operations, schemasMap, url)
    const schemas   = Object.values(schemasMap)
    const validator = new Validator(schemas)

    this._url           = url
    this._spec          = spec
    this._validator     = validator
    this._schemasMap    = schemasMap
    this._operationsMap = operationsMap
  }

  get baseUrl() {
    return this._url
  }

  get validator() {
    return this._validator
  }

  get spec() {
    return this._spec
  }

  get basePath() {
    return this._spec.basePath
  }

  getOperationId(httpMethod, httpPath) {
    return get(this._spec.paths, `${httpPath}.${httpMethod}.operationId`, 'NONE')
  }

  handler(request, logger) {
    return handler(this)(request, logger)
  }

  async process(context) {
    const { operationId } = context
    const Operation = this._operationsMap[operationId]

    let response = {}

    try {
      const { httpMethod, httpPath } = context
      if (!Operation) { throw new OperationNotFoundError({ operationId, httpMethod, httpPath }) }

      context.identity = await authorize(Operation, context)
      const isUpdate = Operation.type === Operation.types.UPDATE
      const parameters = this._getParameters(Operation.inputSchema, context, isUpdate)

      const operation = new Operation(context)
      response = await operation.exec(parameters)

      response.output     = this._getOutput(Operation.outputSchema, response.result)
      response.statusCode = this._getStatusCode(Operation)

    } catch (error) {
      let errorStatusCode

      const { code } = error

      if (Operation) {
        errorStatusCode = get(Operation.errors, `${code}.statusCode`, 500)

      } else {
        errorStatusCode = get(error, 'statusCode', 500)

      }

      response.output     = new OperationError(context, errorStatusCode, error).validate()
      response.statusCode = errorStatusCode
    }

    const { output, statusCode, headers, multiValueHeaders } = response

    if (!output) {
      return { statusCode, headers, multiValueHeaders }
    }

    const body = JSON.stringify(output, null, 2)

    return { statusCode, headers, multiValueHeaders, body }
  }

  _getParameters(inputSchema, context, shouldNullifyEmptyValues) {
    if (!inputSchema) { return {} }

    const { query, mutation } = context
    const input = { ...query, mutation }

    let result

    try {
      result = this._validator.validate(input, inputSchema.id, shouldNullifyEmptyValues)

    } catch (validationError) {
      throw new InvalidInputError(validationError, context)

    }

    return result
  }

  _getOutput(outputSchema, object) {
    if (!outputSchema) { return null }

    let output

    try {
      output = this._validator.validate(object, outputSchema.id, false, true)

    } catch (validationError) {
      throw new InvalidOutputError(object, validationError)

    }

    return output
  }

  _getStatusCode(Operation) {
    if (!Operation.outputSchema) {
      return 204
    }

    if (Operation.type === Operation.types.CREATE) {
      return 201
    }

    return 200
  }
}

module.exports = Service
