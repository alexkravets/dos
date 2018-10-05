'use strict'

const path = require('path')
const fs   = require('fs')
const log  = console

class Http {
  constructor({ spec, operations }) {
    const express    = require('express')
    const bodyParser = require('body-parser')

    const indexHtml = fs.readFileSync(path.resolve(__dirname, '../assets/index.html'), 'utf8')

    this.host = spec.host
    this.port = Number(this.host.split(':')[1])

    const { basePath, info } = spec

    this.http = express()
    this.http.use(bodyParser.json())

    this.http.get('/', (req, res) => {
      const html = indexHtml
        .replace('$BASE_PATH', basePath)
        .replace('$TITLE', info.title)
      return res.set('Content-Type', 'text/html').send(html)
    })

    for (const operation of operations) {
      const { method, path } = operation
      this.http[method](`${basePath}${path}`, this.mapOperation(operation))
    }

    // TODO: Update this error handler to match new error convention
    this.http.use((req, res) => {
      res.status(404).json({
        code:    'ROUTE_NOT_FOUND',
        message: 'Requested route is not found'
      })
    })

    // TODO: Update this error handler to match new error convention
    this.http.use((error, req, res, next) => { // eslint-disable-line
      res.status(500).json({
        code:          'INTERNAL_SERVER_ERROR',
        message:       error.message,
        originalError: error
      })
    })
  }

  mapOperation(operation) {
    return async(req, res) => {
      log.info(`\x1b[33m${req.method} ${req.originalUrl}\x1b[0m`)

      req.mutation = req.body

      const handler  = new operation(req)
      const response = await handler.exec()

      const { statusCode, result, headers } = response

      for (const name in headers) {
        res.setHeader(name, headers[name])
      }

      res.status(statusCode).json(result)

      let statusColor = '\x1b[32m['
      if (statusCode >= 400) { statusColor = '\x1b[35m[' }
      if (statusCode >= 500) { statusColor = '\x1b[31m[' }

      log.info(`${statusColor}${response.statusCode}]\x1b[0m`,
        result, '\x1b[2m', headers, '\x1b[0m')
    }
  }

  listen() {
    const Promise = require('bluebird')

    return new Promise(resolve => this.http.listen(this.port, () => {
      log.info(`\x1b[32mServer started at: http://${this.host}\x1b[0m`)
      resolve(this)
    }))
  }
}

module.exports = Http
