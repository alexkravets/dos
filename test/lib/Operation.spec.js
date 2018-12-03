'use strict'

const Read   = require('lib/operations/Read')
const Index  = require('lib/operations/Index')
const Create = require('lib/operations/Create')
const Update = require('lib/operations/Update')
const Delete = require('lib/operations/Delete')
const Operation  = require('lib/Operation')
const { expect } = require('chai')

describe('Read.resource', () => {
  it('throws Error if resource method is not overloaded', () => {
    expect(() => Read.resource).to
      .throw('Operation `Read` requires `resource` to be defined')
  })
})

describe('Index.resource', () => {
  it('throws Error if resource method is not overloaded', () => {
    expect(() => Index.resource).to
      .throw('Operation `Index` requires `resource` to be defined')
  })
})

describe('Create.resource', () => {
  it('throws Error if resource method is not overloaded', () => {
    expect(() => Create.resource).to
      .throw('Operation `Create` requires `resource` to be defined')
  })
})

describe('Update.resource', () => {
  it('throws Error if resource method is not overloaded', () => {
    expect(() => Update.resource).to
      .throw('Operation `Update` requires `resource` to be defined')
  })
})

describe('Delete.resource', () => {
  it('throws Error if resource method is not overloaded', () => {
    expect(() => Delete.resource).to
      .throw('Operation `Delete` requires `resource` to be defined')
  })
})

describe('Operation.statusCode(status)', () => {
  it('throws Error if invalid status', () => {
    expect(() => Operation.statusCode('BAD_STATUS')).to
      .throw('Invalid status `BAD_STATUS` for operation `Operation`')

    expect(() => Operation.statusCode(null)).to
      .throw('Invalid status `null` for operation `Operation`')

    expect(() => Operation.statusCode()).to
      .throw('Invalid status `undefined` for operation `Operation`')
  })
})

describe('Operation.outputSchema', () => {
  it('returns null if resource is not overloaded', () => {
    expect(Operation.outputSchema).to.equal(null)
  })
})

describe('.composer', () => {
  it('throws Error if composer is missing in the context', () => {
    const operation = new Operation({})

    expect(() => operation.composer).to
      .throw('Operation `Operation` context is missing `composer`')
  })
})

describe('._errorStatus(error)', () => {
  it('returns `Internal Server Error` if error code is not found in errors map', () => {
    const operation = new Operation({})
    const error  = { code: 'ERROR_CODE' }
    const status = operation._errorStatus(error)

    expect(status).to.equal('Internal Server Error')
  })
})

describe('.result', () => {
  it('returns `null` if result is not set', () => {
    const operation = new Operation({})
    expect(operation.result).to.equal(null)
  })
})
