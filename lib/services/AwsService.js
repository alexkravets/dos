'use strict'

const AWS     = require('aws-sdk')
const config  = require('config')
const Promise = require('bluebird')
const options = require('./options')

class AwsService {
  constructor() {
    this._provider   = new AWS.CognitoIdentityServiceProvider(options)
    this._clientId   = config.get('cognito.ClientId')
    this._userPoolId = config.get('cognito.UserPoolId')
  }

  async _method(methodName, parameters = {}) {
    if (global.mockService) {
      const result = mockService.request(methodName, parameters)
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
