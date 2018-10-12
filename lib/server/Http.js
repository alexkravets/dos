'use strict'

const fs    = require('fs')
const path  = require('path')
const http  = require('http')
const chalk = require('chalk')
const statuses = require('statuses')
const handler  = require('./handler')

class Http {
  constructor(config) {
    this._port     = config.port
    this._host     = config.host
    this._title    = config.title
    this._routes   = config.routes
    this._basePath = config.basePath

    this._server = http.createServer((req, res) => this._handler(req, res))
  }

  _buildError(statusCode, code, error) {
    const body = JSON.stringify({
      error: {
        originalError: error,
        message:       error.message,
        code
      }
    }, null, 2)

    return { statusCode, body }
  }

  _parseBody(req, callback) {
    // NOTE: https://github.com/stream-utils/raw-body/blob/master/index.js
    if (req.method === 'GET') { return callback() }

    let buffer     = []
    let isComplete = false

    const done = error => {
      isComplete = true
      callback(error)
      cleanup()
    }

    const onAborted = () => {
      if (isComplete) { return }
      const error = this._buildError(400, 'REQUEST_ABORTED', new Error('Request aborted'))
      done(error)
    }

    const onData = chunk => {
      if (isComplete) { return }
      buffer.push(chunk)
    }

    const onEnd = () => {
      if (isComplete) { return }
      req.body = Buffer.concat(buffer).toString()
      done()
    }

    const onError = err => {
      if (isComplete) { return }
      const error = this._buildError(400, 'STREAM_ERROR', err)
      done(error)
    }

    const cleanup = () => {
      buffer = null

      req.removeListener('aborted', onAborted)
      req.removeListener('data', onData)
      req.removeListener('end', onEnd)
      req.removeListener('error', onError)
      req.removeListener('close', cleanup)
    }

    req.on('aborted', onAborted)
    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onError)
    req.on('close', cleanup)
  }

  _parseParameters(req) {
    const { query, pathname } = require('url').parse(req.url, true)

    req.query       = query
    req.operationId = pathname
      .replace(`${this._basePath}/`, '')
      .replace('/', '')
  }

  _logRequest(req) {
    const { method, body, url } = req
    console.info(chalk`{cyan ${method}} {yellow ${url}} {dim ${body || ''}}`)
  }

  _setHeaders(res, headers = {}) {
    headers['Content-Type'] = 'application/json; charset=utf-8'

    for (const name in headers) {
      res.setHeader(name, headers[name])
    }
  }

  _logResponse(method, statusCode, body) {
    const isQuery = method === 'GET'
    const status  = statuses[statusCode]

    if (statusCode >= 500) {
      console.error(chalk`{red ${status}} {dim ${body}}`)

    } else if (statusCode >= 400) {
      console.debug(chalk`{yellow ${status}} {dim ${body}}`)

    } else {
      if (isQuery) {
        console.debug(chalk`{cyan ${status}} {dim ${body}}`)

      } else {
        console.debug(chalk`{magenta ${status}} {dim ${body}}`)

      }
    }
  }

  _send(req, res, { statusCode, headers, body }) {
    res.statusCode = statusCode

    this._setHeaders(res, headers)

    res.end(body, () => this._logResponse(req.httpMethod, statusCode, body))
  }

  _renderIndexHtml(res) {
    const filePath = path.resolve(__dirname, '../assets/index.html')

    fs.readFile(filePath, { encoding: 'utf8' },  (err, data) => {
      const html = data
        .replace('$BASE_PATH', this._basePath)
        .replace('$TITLE', this._title)

      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    })
  }

  _handler(req, res) {
    this._parseBody(req, async(error) => {
      if (error) { return this._send(req, res, error) }

      let result
      try {
        this._parseParameters(req)
        this._logRequest(req)

        if (req.url == '/') { return this._renderIndexHtml(res) }

        result = await handler(this._routes, req)

      } catch (error) {
        result = this._buildError(500, 'INTERNAL_SERVER_ERROR', error)

      }

      return this._send(req, res, result)
    })
  }

  listen() {
    this._server.listen(this._port, () => {
      console.info(chalk`Server started at: {red http://${this._host}}`)
    })
  }
}

module.exports = Http
