'use strict'

const http      = require('http')
const Promise   = require('bluebird')
const { parse } = require('url')
const OperationError = require('./OperationError')

class Http {
  static error(status, code, message) {
    const error = new OperationError({}, status, { code, message })
    const body  = JSON.stringify(error, null, 2)
    const { statusCode } = error

    return { statusCode, body }
  }

  constructor(port, router) {
    this._port   = port
    this._router = router
    this._server = http.createServer((req, res) => {
      req.path = parse(req.url).pathname

      this._readBody(req, async(error) => {
        if (error) { return this._send(req, res, error) }

        const result = await this._router.process(req)
        return this._send(req, res, result)
      })
    })
  }

  _readBody(req, callback) {
    // NOTE: https://github.com/stream-utils/raw-body/blob/master/index.js
    if (req.method === 'GET') { return callback() }

    let buffer     = []
    let isComplete = false

    const onData = chunk => {
      if (isComplete) { return }
      buffer.push(chunk)
    }

    const done = error => {
      isComplete = true
      callback(error)
      cleanup()
    }

    const onEnd = () => {
      if (isComplete) { return }
      req.body = Buffer.concat(buffer).toString()
      done()
    }

    const onAborted = () => {
      if (isComplete) { return }
      const error = Http.error('Bad Request', 'RequestAborted', 'Request aborted')
      done(error)
    }

    const onError = err => {
      if (isComplete) { return }
      const error = Http.error('Bad Request', 'StreamError', err.message)
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

  _send(req, res, { statusCode, headers, body }) {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    for (const name in headers) {
      res.setHeader(name, headers[name])
    }

    res.end(body)
  }

  async listen() {
    return new Promise(resolve => this._server.listen(this._port, resolve))
  }
}

module.exports = Http
