'use strict'

const { resolve } = require('path')
const readYamlFile = require('read-yaml-file')
const { readFileSync } = require('fs')

const SWAGGER_UI_TEMPLATE_PATH = resolve(__dirname, '../../assets/index.html')
const SWAGGER_UI_TEMPLATE = readFileSync(SWAGGER_UI_TEMPLATE_PATH, { encoding: 'utf8' })

const ROOT_PATH = process.cwd()
const { name: title, version } = require(`${ROOT_PATH}/package.json`)

const SWAGGER_UI_HTML = SWAGGER_UI_TEMPLATE.replace('$TITLE', title)

const isDevelopment = () => process.env.NODE_APP_INSTANCE === 'dev' || !process.env.NODE_APP_INSTANCE

const _getHomeBody = () => isDevelopment() ? SWAGGER_UI_HTML : 'healthy'

const _getSpecBody = (service) => isDevelopment() ? service.spec : { info: { title, version } }

const specMiddleware = (service, context) => {
  const { httpPath, httpMethod } = context

  if (httpMethod !== 'get') { return null }

  if (httpPath === '/') {
    const bodyText = _getHomeBody()

    return {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      statusCode: 200,
      body: bodyText,
    }
  }

  if (httpPath === '/Spec') {
    const bodyJson = JSON.stringify(_getSpecBody(service), null, 2)

    return {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      statusCode: 200,
      body: bodyJson,
    }
  }

  const readFileJson = httpPath => {
    const fileName = httpPath.replace('/', '')
    const source = readYamlFile.sync(`${ROOT_PATH}/specs/${fileName}`)

    return JSON.stringify(source, null, 2)
  }

  const isComposer = [
    '/Enums.yaml',
    '/Schemas.yaml',
    '/Documents.yaml',
    '/Scenarios.yaml',
    '/Operations.yaml',
    '/Parameters.yaml'
  ].includes(httpPath)

  const shouldReturnComposerSpecs = isComposer && isDevelopment()

  if (shouldReturnComposerSpecs) {
    return {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      statusCode: 200,
      body: readFileJson(httpPath),
    }
  }

  return null
}

module.exports = specMiddleware
