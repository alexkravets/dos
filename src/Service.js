'use strict'

const isString           = require('lodash.isstring')
const { Validator }      = require('@kravc/schema')
const createContext      = require('./helpers/createContext')
const OperationError     = require('./errors/OperationError')
const createSchemasMap   = require('./helpers/createSchemasMap')
const InvalidInputError  = require('./errors/InvalidInputError')
const InvalidOutputError = require('./errors/InvalidOutputError')
const OperationNotFoundError = require('./errors/OperationNotFoundError')

class Service {
  constructor(modules) {
    const components = modules
    const operations = modules

    const schemasMap = createSchemasMap(components, operations)
    const schemas    = Object.values(schemasMap)
    const validator  = new Validator(schemas)

    this._validator     = validator
    this._schemasMap    = schemasMap
    this._operationsMap = {}
  }

  get validator() {
    return this._validator
  }

  get basePath() {
    return ''
  }

  getOperationId(httpMethod, httpPath) {
    return this._httpRoutes[`${httpMethod}:${httpPath}`]
  }

  async process(context) {
    const { operationId } = context
    const Operation = this._operationsMap[operationId]

    let response

    try {
      const { httpMethod, httpPath } = context
      if (!Operation) { throw new OperationNotFoundError({ operationId, httpMethod, httpPath }) }

      context.identity = await Operation.authorize(context)
      const parameters = this._getParameters(Operation.inputSchema, context)

      const operation = new Operation(context)
      response = await operation.exec(parameters)

      response.output     = this._getOutput(Operation.outputSchema, response.result)
      response.statusCode = this._getStatusCode(Operation)

    } catch (error) {
      let errorStatusCode

      const { code } = error

      if (Operation && Operation.errors[code]) {
        errorStatusCode = Operation.errors[code].statusCode

      } else {
        errorStatusCode = 500

      }

      response.output     = new OperationError(context, errorStatusCode, error).json
      response.statusCode = errorStatusCode

    }

    const { output, statusCode, headers } = response

    if (!output) {
      return { statusCode, headers }
    }

    const body = isString(output) ? output : JSON.stringify(output, null, 2)

    return { statusCode, headers, body }
  }

  _getParameters(inputSchema, context) {
    if (!inputSchema) { return {} }

    const { query, mutation } = context
    const input = { ...query, mutation}

    let result

    try {
      result = this._validator.validate(input, inputSchema.id)

    } catch (validationError) {
      throw new InvalidInputError(validationError, context)

    }

    return result
  }

  _getOutput(outputSchema, object) {
    if (!outputSchema) { return null }

    let output

    try {
      output = this._validator.validate(object, outputSchema.id)

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

  static handler(service, _createContext = createContext) {
    return request => {
      const context = _createContext(service, request)
      return service.process(context)
    }
  }
}

module.exports = Service
