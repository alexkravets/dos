'use strict'

const omit          = require('lodash.omit')
const ZSchema       = require('z-schema')
const { parse }     = require('url')
const jsonSchema    = require('../../assets/schemas/oas2.json')
const getHttpMethod = require('./getHttpMethod')
const getSuccessStatusCode = require('./getSuccessStatusCode')

const ROOT_PATH = process.cwd()
const { name: title, version } = require(`${ROOT_PATH}/package.json`)

const formatErrorResponseDescription = errors => {
  return errors
    .map(({ code, description }) =>  {
      if (!description) { return `\`${code}\`` }

      return `\`${code}\` — ${description}`
    })
    .join('\n')
}

const createSpec = (operations, schemasMap, url) => {
  const { protocol: _protocol, host, path: basePath } = parse(url)
  const protocol = _protocol.replace(':', '')

  const spec = {
    swagger: '2.0',
    host,
    basePath,
    schemes:  [ protocol ],
    info: {
      title,
      version
    },
    consumes: [ 'application/json' ],
    produces: [ 'application/json' ],
    tags: [],
    securityDefinitions: {},
    paths: {},
    definitions: {}
  }

  for (const schemaId in schemasMap) {
    const isNotInputSchema = !schemaId.endsWith('Input')

    if (isNotInputSchema) {
      const schema = schemasMap[schemaId]
      spec.definitions[schemaId] = omit(schema.jsonSchema, [ 'id' ])
    }
  }

  for (const Operation of operations) {
    const httpPath    = `/${Operation.id}`
    const httpMethod  = getHttpMethod(Operation)
    const operationId = Operation.id

    const {
      tags,
      query,
      errors,
      summary,
      security,
      description,
      outputSchema,
      mutationSchema
    } = Operation

    const operationSpec = {
      tags,
      summary,
      description,
      operationId
    }

    const parameters = []

    for (const name in query) {
      const queryParameter = { in: 'query', name, type: 'string', ...query[name] }
      delete queryParameter.example

      parameters.push(queryParameter)
    }

    if (mutationSchema) {
      parameters.push({
        in:       'body',
        name:     'mutation',
        schema:   { $ref: mutationSchema.id },
        required: true
      })
    }

    const hasParameters = parameters.length > 0

    if (hasParameters) {
      operationSpec.parameters = parameters
    }

    const successStatusCode = getSuccessStatusCode(Operation)
    const success = { description: 'Successful operation execution response' }

    if (outputSchema) {
      success.schema = { $ref: outputSchema.id }
    }

    const responses = {
      [successStatusCode]: success,
      default: {
        description: '`OperationError` — Default operation error',
        schema: { $ref: 'OperationError' }
      }
    }

    const errorsMap = {}

    for (const code in errors) {
      const { statusCode, description } = errors[code]

      errorsMap[`${statusCode}`] = errorsMap[`${statusCode}`] || []
      errorsMap[`${statusCode}`].push({ code, description })
    }

    for (const statusCode in errorsMap) {
      const description = formatErrorResponseDescription(errorsMap[statusCode])

      responses[`${statusCode}`] = {
        schema: { $ref: 'OperationError' },
        description
      }
    }

    operationSpec.responses = responses

    const hasSecurityRequirements = security.length > 0

    if (hasSecurityRequirements) {
      operationSpec.security = []

      for (const requirements of security) {

        const config = {}
        for (const name in requirements) {
          const { definition } = requirements[name]
          spec.securityDefinitions[name] = definition

          config[name] = []
        }

        operationSpec.security.push(config)
      }
    }

    spec.paths[httpPath] = { [httpMethod]: operationSpec }
  }

  const json = JSON
    .stringify(spec, null, 2)
    .replace(/"\$ref": "/g, '"$ref": "#/definitions/')

  const result = JSON.parse(json)

  const validator = new ZSchema({ ignoreUnknownFormats: true })
  const isValid = validator.validate(result, { id: 'Spec', ...jsonSchema })

  if (!isValid) {
    const validationErrors = validator.getLastErrors()

    const json = JSON.stringify(validationErrors, null, 2)
    throw new Error(`Service spec validation failed: ${json}`)
  }

  return result
}

module.exports = createSpec
