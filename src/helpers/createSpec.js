'use strict'

const { parse }     = require('url')
// const { resolve }   = require('path')
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

const createSpec = (operations, schemasMap, url = 'http://localhost:3000/') => {
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
      spec.definitions[schemaId] = schema.jsonSchema
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
      const queryParameter = { in: 'query', name, ...query[name] }
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
        description: 'Default operation error',
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

    spec.paths[httpMethod] = { [httpPath]: operationSpec }
  }

  const json = JSON
    .stringify(spec, null, 2)
    .replace(/"\$ref": "/g, '"$ref": "#/definitions/')

  const result = JSON.parse(json)

  // const schemaPath = resolve(__dirname, '../assets/schemas/oas2/schema.json')
  // const jsonSchema = require(schemaPath)

  // const validator = new ZSchema({ ignoreUnknownFormats: true })
  // const isValid = validator.validate(result, { id: 'Spec', ...jsonSchema })

  console.dir(result, { depth: 10 })

  return result
}

module.exports = createSpec
