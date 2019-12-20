'use strict'

const Read       = require('lib/operations/Read')
const Index      = require('lib/operations/Index')
const Create     = require('lib/operations/Create')
const Update     = require('lib/operations/Update')
const Delete     = require('lib/operations/Delete')
const Composer   = require('lib/Composer')
const Operation  = require('lib/Operation')
const { expect } = require('chai')

// class Component {}

describe('Read(Component, componentAction)', () => {
  it('throws Error if "Component" argument is not defined', () => {
    expect(() => Read()).to
      .throw('Argument "Component" is undefined for "Read" operation function')
  })

  // it('throws Error if invalid "componentAction" argument value', () => {
  //   expect(() => Read(Component, 'missingStaticMethod')).to
  //     .throw('Component action method "Component.missingStaticMethod(context, query, options)" is not defined')
  // })
})

describe('Index(Component, componentAction)', () => {
  it('throws Error if "Component" argument is not defined', () => {
    expect(() => Index()).to
      .throw('Argument "Component" is undefined for "Index" operation function')
  })

  // it('throws Error if invalid "componentAction" argument value', () => {
  //   expect(() => Index(Component, 'missingStaticMethod')).to
  //     .throw('Component action method "Component.missingStaticMethod(context, query, options)" is not defined')
  // })
})

describe('Create(Component, componentAction)', () => {
  it('throws Error if "Component" argument is not defined', () => {
    expect(() => Create()).to
      .throw('Argument "Component" is undefined for "Create" operation function')
  })

  // it('throws Error if invalid "componentAction" argument value', () => {
  //   expect(() => Create(Component, 'missingStaticMethod')).to
  //     .throw('Component action method "Component.missingStaticMethod(context, query, attributes)" is not defined')
  // })
})

describe('Update(Component, componentAction)', () => {
  it('throws Error if "Component" argument is not defined', () => {
    expect(() => Update()).to
      .throw('Argument "Component" is undefined for "Update" operation function')
  })

  // it('throws Error if invalid "componentAction" argument value', () => {
  //   expect(() => Update(Component, 'missingStaticMethod')).to
  //     .throw('Component action method "Component.missingStaticMethod(context, query, attributes)" is not defined')
  // })
})

describe('Delete(Component, componentAction)', () => {
  it('throws Error if "Component" argument is not defined', () => {
    expect(() => Delete()).to
      .throw('Argument "Component" is undefined for "Delete" operation function')
  })

  // it('throws Error if invalid "componentAction" argument value', () => {
  //   expect(() => Delete(Component, 'missingStaticMethod')).to
  //     .throw('Component action method "Component.missingStaticMethod(context, query)" is not defined')
  // })
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

describe('Operation.tags', () => {
  it('returns empty array if tags is not overloaded', () => {
    expect(Operation.tags).to.be.empty
  })
})

describe('.composer', () => {
  it('throws Error if composer is missing in the context', () => {
    expect(() => new Operation({})).to
      .throw('Composer is not defined while operation context initialization')
  })
})

describe('._errorStatus(error)', () => {
  it('returns `Internal Server Error` if error code is not found in errors map', () => {
    const composer  = new Composer(null, { operations: [], config: {}})
    const operation = new Operation({ composer })
    const error  = { code: 'ERROR_CODE' }
    const status = operation._errorStatus(error)

    expect(status).to.equal('Internal Server Error')
  })
})

describe('.result', () => {
  it('returns `null` if result is not set', () => {
    const composer  = new Composer(null, { operations: [], config: {}})
    const operation = new Operation({ composer })
    expect(operation.result).to.equal(null)
  })
})
