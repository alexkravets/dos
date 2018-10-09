'use strict'

const path     = require('path')
const fs       = require('fs')
const chalk    = require('chalk')
const statuses = require('statuses')

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

    this.http.use((req, res) => {
      res.status(404).json({
        error: {
          code:    'ROUTE_NOT_FOUND',
          message: `Route not found: ${method} ${req.originalUrl}`
        }
      })
    })

    this.http.use((error, req, res, next) => { // eslint-disable-line
      res.status(500).json({
        error: {
          code:          'INTERNAL_SERVER_ERROR',
          message:       error.message,
          originalError: error
        }
      })
    })
  }

  _logRequest(req) {
    const isQuery = req.method === 'GET'

    if (isQuery) {
      const parameters = JSON.stringify({ query: req.query }, null, 2)
      console.info(chalk`{cyan ${req.method}} {yellow ${req.originalUrl}} {dim ${parameters}}`)

    } else {
      const parameters = JSON.stringify({ query: req.query, mutation: req.mutation }, null, 2)
      console.info(chalk`{magenta ${req.method}} {yellow ${req.originalUrl}} {dim ${parameters}}`)

    }
  }

  _logResponse(req, statusCode, result) {
    const isQuery = req.method === 'GET'
    const json    = JSON.stringify(result, null, 2)
    const status  = statuses[statusCode]

    if (statusCode >= 500) {
      console.error(chalk`{red ${status}} {dim ${json}}`)

    } else if (statusCode >= 400) {
      console.debug(chalk`{yellow ${status}} {dim ${json}}`)

    } else {
      if (isQuery) {
        console.debug(chalk`{cyan ${status}} {dim ${json}}`)

      } else {
        console.debug(chalk`{magenta ${status}} {dim ${json}}`)

      }
    }
  }

  mapOperation(operation) {
    return async(req, res) => {
      req.mutation = req.body

      this._logRequest(req)

      const handler  = new operation(req)
      const response = await handler.exec()

      const { statusCode, result, headers } = response

      for (const name in headers) {
        res.setHeader(name, headers[name])
      }

      res.status(statusCode).json(result)

      this._logResponse(req, statusCode, result)
    }
  }

  listen() {
    const Promise = require('bluebird')

    return new Promise(resolve => this.http.listen(this.port, () => {
      console.info(chalk`Server started at: {red http://${this.host}}`)
      resolve(this)
    }))
  }
}

module.exports = Http
