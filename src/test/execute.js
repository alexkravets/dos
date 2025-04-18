'use strict'

const SUCCESS_HTTP_CODES = [200, 201, 204]
const NO_RESPONSE_HTTP_CODE = 204

const execute = (service, extraContext) => {
  const exec = async (operationId, input = {}, headers = {}) => {
    const { mutation: body, ...queryStringParameters } = input

    const request = {
      body,
      headers,
      operationId,
      queryStringParameters
    }

    const response = await service.handler(request, extraContext)

    let result

    if (response.body) {
      result = JSON.parse(response.body)
    }

    return { ...response, result }
  }

  const request = async (operationId, parameters, headers) => {
    const { statusCode, result } = await exec(operationId, parameters, headers)

    let error
    let data

    const isResultExpected = statusCode !== NO_RESPONSE_HTTP_CODE

    if (isResultExpected) {
      error = result.error
      data = result.data
    }

    const isSuccess = SUCCESS_HTTP_CODES.includes(statusCode)

    if (!isSuccess) {
      console.error(`\x1b[31mRequestError for "${operationId}"\x1b[37m`)
      console.dir({ operationId, parameters, error }, { depth: null })

      throw Error(`RequestError for "${operationId}"`)
    }

    return data
  }

  const expectError = async (operationId, parameters, headers, errorCode) => {
    const { statusCode, result } = await exec(operationId, parameters, headers)

    const error = result.error
    const data = result.data

    const isSuccess = SUCCESS_HTTP_CODES.includes(statusCode)

    if (isSuccess) {
      console.error(`\x1b[31mSuccess NOT expected for "${operationId}"\x1b[37m`)
      console.dir({ operationId, statusCode, parameters, data }, { depth: null })

      throw Error(`Success NOT expected for "${operationId}"`)
    }

    const isExpectedCode = error.code === errorCode

    if (!isExpectedCode) {
      throw Error(`Unexpected error code received "${error.code}", expected "${errorCode}"`)
    }

    return error
  }

  return {
    exec,
    request,
    expectError,
  }
}

module.exports = execute
