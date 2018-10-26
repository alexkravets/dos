'use strict'

const Handler    = require('lib/Handler')
const { expect } = require('chai')
const { Health } = require('test/app/api')[0]
const { Operation } = require('@slatestudio/adept')

describe('Handler()', () => {
  describe('.action()', () => {
    it('sets result to null', async() => {
      class DefaultAction extends Handler(Operation) {
      }

      const handler = new DefaultAction()
      await handler.action()

      expect(handler.result).to.be.null
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

      const handler = new NoOutput({})
      const { statusCode, result } = await handler.exec()

      console.log(result)

      expect(statusCode).to.be.equal(204)
    })
  })

  describe('._verifyResult()', () => {
    it('does not verify response if shouldVerifyResponse is false', async() => {
      const handler = new Health({})
      await handler.exec()
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

      const handler = new InHeadersWeTrust({})
      await handler.exec()
    })
  })

  describe('.exec()', () => {
    it('throws OperationError for unhandled exception', async() => {
      class BreakingBad extends Health {
        async action() {
          this.boom()
        }
      }

      const handler = new BreakingBad({})
      const { result, statusCode } = await handler.exec()

      expect(statusCode).to.equal(500)
      expect(result.error.code).to.equal('OperationError')
    })
  })
})
