'use strict'

const { resolve }      = require('path')
const { readFileSync } = require('fs')

const SWAGGER_UI_TEMPLATE_PATH = resolve(__dirname, '../../assets/index.html')
const SWAGGER_UI_TEMPLATE = readFileSync(SWAGGER_UI_TEMPLATE_PATH, { encoding: 'utf8' })

const ROOT_PATH = process.cwd()
const { name: title, version } = require(`${ROOT_PATH}/package.json`)

const SWAGGER_UI_HTML = SWAGGER_UI_TEMPLATE.replace('$TITLE', title)

const isProduction = process.env.NODE_APP_INSTANCE === 'prd'

const specMiddleware = (service, context) => {
  const { httpPath, httpMethod } = context

  if (httpMethod !== 'get') { return null }

  if (httpPath === '/') {
    return {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      statusCode: 200,
      body: isProduction ? 'healthy' : SWAGGER_UI_HTML
    }
  }

  if (httpPath === '/Spec') {
    return {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      statusCode: 200,
      body: JSON.stringify(isProduction ? { info: { title, version } } : service.spec, null, 2)
    }
  }

  return null
}

module.exports = specMiddleware
