'use strict'

const httpRequest = require('./httpRequest')

const jsonRequest = async(logger, options) => {
  options.headers = options.headers || {}
  options.headers['Accept']       = 'application/json'
  options.headers['Content-Type'] = 'application/json'

  if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body, null, 2)
  }

  if (!options.body) {
    delete options.body
  }

  const res = await httpRequest(logger, options)

  const ok = !(res.statusCode >= 400)

  let text   = ''
  let object = {}

  const isNoContent = res.statusCode === 204

  if (!isNoContent) {
    text = res.body.toString()

    object = {}

    if (text) {
      try {
        object = JSON.parse(text)

      } catch (error) {
        throw new Error(`Respose body is not in a JSON format: "${text}"`)

      }
    }
  }

  const response = {
    ok,
    text,
    object,
    options,
    headers:    res.headers,
    statusCode: res.statusCode,
    statusText: res.statusMessage
  }

  return response
}

module.exports = jsonRequest
