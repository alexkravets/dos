'use strict'

const config      = require('config')
const Composer    = require('lib/Composer')
const Operation   = require('lib/Operation')
const { expect }  = require('chai')
const UserProfile = require('test/example/models/UserProfile')

const schemasPath = './test/example/schemas'
const components  = [ UserProfile ]
const operations  = require('test/example/api')

let composer
before(() => {
  composer = new Composer(schemasPath, { operations, config })
})

describe('Composer.loadSchemas(path)', () => {
  it('reads schemas from path', () => {
    Composer.loadSchemas(schemasPath)
  })

  it('raises exception if invalid path', () => {
    expect(() => Composer.loadSchemas(schemasPath + '/INVALID'))
      .to.throw('Can\'t find schemas at')
  })
})

describe('Composer.validateSchemas(schemas, scope)', () => {
  it('validates schemas', () => {
    const schemas = Composer.loadSchemas(schemasPath)
    Composer.validateSchemas(schemas, 'Schemas')
  })

  it('throws error if object without jsonSchema is included in schemas', () => {
    const schemas = Composer.loadSchemas(schemasPath)
    schemas['InvalidSchema'] = {}
    expect(() => Composer.validateSchemas(schemas, 'Schemas'))
      .to.throw('Schema `InvalidSchema` is not a valid Schema instance')
  })

  it('throws validation exception if schemas are not valid', () => {
    const schemas = Composer.loadSchemas(schemasPath)
    schemas.UserProfile._source.hobby = { $ref: 'Hobby' }

    expect(() => Composer.validateSchemas(schemas, 'Schemas'))
      .to.throw('Schemas validation error')
  })
})

describe('Composer.constructor(path, { components, operations })', () => {
  let composer

  it('initializes composer', () => {
    composer = new Composer(schemasPath, { components, operations })

    expect(composer.schemas).to.have.property('OperationError')
    expect(composer.schemas).to.have.property('CreateUserProfileInput')
    expect(composer.schemas).to.have.property('CreateUserProfileInputMutation')
    expect(composer.schemas).to.have.property('CreateUserProfileOutput')
  })

  it('overrides schemas with components schemas', () => {
    expect(composer.schemas).to.have.property('UserProfile')
    expect(composer.schemas.UserProfile._source).to.have.property('createdAt')
  })

  it('throws Error if declared resourceAction is missing', () => {
    class NoResourceOperation extends Operation {
    }

    class DeactivateUserProfile extends Operation {
      static get resource() {
        return UserProfile
      }

      static get resourceAction() {
        return 'deactivate'
      }
    }

    const operations = [ NoResourceOperation, DeactivateUserProfile ]
    expect(() => new Composer(schemasPath, { components, operations })).to
      .throw('Resource action `deactivate` is not defined for resource `UserProfile`')
  })
})

describe('.validate(schemaId, object)', () => {
  it('validates object using schema', async() => {
    const composer = new Composer(schemasPath, { components })

    const userProfile = {
      id: 'USER_PROFILE_ID',
      firstName: 'Alexander',
      lastName:  'Kravets',
      createdAt: new Date().toJSON()
    }

    await composer.validate('UserProfile', userProfile)
  })

  it('throws Error if schema is not registered', async() => {
    const composer = new Composer(schemasPath, {})
    try {
      await composer.validate('UserProperties', {})

    } catch (error) {
      expect(error).to.have.property('message', 'UserProperties schema is not registered')

      return
    }

    throw new Error('Validation exception has not been thrown')
  })

  it('throws ValidationError if object is not valid', async() => {
    const composer = new Composer(schemasPath, { components })

    const userProfile = {
      firstName: 'Alexander'
    }

    try {
      await composer.validate('UserProfile', userProfile)

    } catch (error) {
      expect(error.code).to.equal('ValidationError')
      expect(error.schemaId).to.equal('UserProfile')
      expect(error.validationErrors[0]).to.have.property('code', 'OBJECT_MISSING_REQUIRED_PROPERTY')

      return
    }

    throw new Error('Validation exception has not been thrown')
  })
})

describe('.validateInput(schemaId, object)', async() => {
  it('does cleanup, populates value types, populates default values, validates', async() => {
    const input = {
      id: 'ID',
      mutation: {
        firstName: 'Alexander',
        lastName:  'Kravets',
        age:       '32',
        extra:     'TO BE REMOVED'
      }
    }

    await composer.validateInput('CreateUserProfileInput', input)

    expect(input.mutation).to.include({ age: 32, gender: 'Male' })
    expect(input.mutation).to.not.include.key('extra')
  })
})

describe('.validateOutput(schemaId, object)', () => {
  it('does cleanup, validates', async() => {
    const output = {
      data: {
        id: 'ID',
        firstName: 'Alexander',
        lastName:  'Kravets',
        age:       32,
        gender:    'Male',
        extra:     'TO BE REMOVED',
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
      }
    }

    await composer.validateOutput('CreateUserProfileOutput', output)

    expect(output.data).to.not.include.key('extra')
  })
})

describe('.spec', () => {
  it('returns specification', async() => {
    expect(composer.spec).to.be.not.undefined
    await composer.validateSpec()
  })
})

describe('.validateSpec()', () => {
  it('validates specification', async() => {
    await composer.validateSpec()
  })
})

describe('.config', () => {
  it('returns config', async() => {
    expect(composer.config).to.be.not.undefined
  })
})

describe('.operations', () => {
  it('returns operations', async() => {
    expect(composer.operations).to.be.not.undefined
  })
})
