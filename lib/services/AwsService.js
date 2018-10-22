'use strict'

const AWS     = require('aws-sdk')
const Promise = require('bluebird')
const options = require('../aws/options')

class AwsService {
  constructor() {
    if (!this.service) {
      throw new Error('AWS service is not defined')
    }

    this._provider = new AWS[this.service](options)
  }

  get service() {
    return null
  }

  async _method(methodName, parameters = {}) {
    if (global.mockService) {
      const result = global.mockService.request(methodName, parameters)
      return result
    }

    const promise = new Promise((resolve, reject) =>
      this._provider[methodName](parameters, (error, result) => {
        if (error) { return reject(error) }
        return resolve(result)
      }))

    return promise
  }
}

module.exports = AwsService
