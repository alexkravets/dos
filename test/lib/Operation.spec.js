'use strict'

const Operation  = require('lib/Operation')
const { expect } = require('chai')
const { Health } = require('test/app/api')[0]
const { CreateProfile, UpdateProfile } = require('test/app/api')[1]

describe('Operation()', () => {
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

  describe('.action()', () => {
    it('sets result to null', async() => {
      class DefaultAction extends Operation {
      }

      const operation = new DefaultAction()
      await operation.action()

      expect(operation.result).to.be.null
    })
  })

  describe('._verifySuccessResult()', () => {
    it('does not verify result if output is not defined, resets result to undefined', async() => {
      class NoOutput extends Health {
        static get output() {
          return null
        }

        get shouldVerifyResponse() {
          return true
        }
      }

      const operation = new NoOutput({})
      const { statusCode } = await operation.exec()

      expect(statusCode).to.be.equal(204)
    })
  })

  describe('._verifyResult()', () => {
    it('does not verify response if shouldVerifyResponse is false', async() => {
      const operation = new Health({})
      await operation.exec()
    })
  })

  describe('._response()', () => {
    it('normalizes headers', async() => {
      class InHeadersWeTrust extends Health {
        async action() {
          this.headers = { 'X-In-Headers-We-Trust': 'no' }

          await super.action()
        }
      }

      const operation = new InHeadersWeTrust({})
      await operation.exec()
    })
  })

  describe('.exec()', () => {
    it('throws OperationError for unhandled exception', async() => {
      class BreakingBad extends Health {
        async action() {
          this.boom()
        }
      }

      const operation = new BreakingBad({})
      const { result, statusCode } = await operation.exec()

      expect(statusCode).to.equal(500)
      expect(result.error.code).to.equal('OperationError')
    })
  })
})
