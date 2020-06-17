'use strict'

const execute = service => {
  const exec = service.constructor.handler(service)

  return async (operationId, input = {}, headers = {}) => {
    const { mutation: body, ...queryStringParameters } = input

    const request = {
      body,
      headers,
      operationId,
      queryStringParameters
    }

    const response = await exec(request)

    return response
  }
}

module.exports = execute
