'use strict'

const url   = require('url')
const wait  = require('./wait')
const http  = require('http')
const https = require('https')

const DEFAULT_MAX_ATTEMPTS   = 5
const DEFAULT_RETRY_DELAY_MS = 500

// TODO: Add max file size limit.
const httpRequest = options => {
  if (options.url) {
    options = { ...options, ...url.parse(options.url) }
  }

  if (!options.method) {
    options.method = options.body ? 'POST' : 'GET'
  }

  const client = options.protocol === 'https:' ? https : http

  return new global.Promise((resolve, reject) => {
    const req = client.request(options, res => {
      const buffer = []

      res.on('data', chunk => buffer.push(chunk))

      res.on('end', () => {
        res.body = Buffer.concat(buffer)
        resolve(res)
      })
    })

    req.on('error', reject)

    if (options.timeout) {
      req.setTimeout(options.timeout, () => req.abort())
    }

    if (options.body) {
      const buffer = Buffer.from(options.body)
      req.write(buffer)
    }

    req.end()
  })
}

// TODO: Add follow redirects option.
module.exports = async (logger, options) => {
  const { retryDelay = DEFAULT_RETRY_DELAY_MS } = options

  let { maxAttempts: attemptsLeft = DEFAULT_MAX_ATTEMPTS } = options

  let error
  let response

  while (attemptsLeft > 0) {
    attemptsLeft -= 1

    try {
      response = await httpRequest(options)

    } catch (_error) {
      error = _error

    }

    if (response) { return response }

    const optionsJson = JSON.stringify(options, null, 2)

    logger.warn({ err: error }, `Request has failed, retry in ${retryDelay}ms,` +
      ` ${attemptsLeft} attempts left, options: ${optionsJson}`)

    await wait(retryDelay)
  }

  throw error
}
