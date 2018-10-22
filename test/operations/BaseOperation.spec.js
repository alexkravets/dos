'use strict'

const { expect } = require('chai')
const { CreateProfile, UpdateProfile } = require('test/app/api')[0]

describe('BaseOperation', () => {
  describe('.buildValidators()', () => {
    it('throws error if `actionMethodName` is not defined for resource class', async() => {
      class BadOperation extends CreateProfile {
        static get actionMethodName() {
          return 'methodDoesNotExist'
        }
      }

      const test = () => BadOperation.buildValidators()
      expect(test).to.throw()
    })

    it('throws error if `actionMethodName` is not defined for resource instance', async() => {
      class BadOperation extends UpdateProfile {
        static get actionMethodName() {
          return 'methodDoesNotExist'
        }
      }

      const test = () => BadOperation.buildValidators()
      expect(test).to.throw()
    })
  })
})
