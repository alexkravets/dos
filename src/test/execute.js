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

    let result

    if (response.body) {
      result = JSON.parse(response.body)
    }

    return { ...response, result }
  }
}

module.exports = execute
