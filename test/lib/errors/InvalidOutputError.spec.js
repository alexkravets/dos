'use strict'

const Schema     = require('lib/Schema')
const { expect } = require('chai')
const InvalidOutputError = require('lib/errors/InvalidOutputError')

describe('InvalidOutputError', () => {
  describe('.toJSON()', () => {
    it('returns error as plain object', async() => {
      const profileSchemaSource = {
        name: { type: 'string', required: true }
      }

      const object = {}
      const profileSchema = new Schema('Profile', profileSchemaSource)

      let outputError

      try {
        profileSchema.validate(object)

      } catch (validationError) {
        outputError = new InvalidOutputError(validationError)

      }

      const plainObject = outputError.toJSON()

      expect(plainObject.validationErrors).to.have.lengthOf(1)
      expect(plainObject).to.include({
        code:    'ValidationError',
        message: 'Profile object validation has failed',
      })
    })
  })
})
