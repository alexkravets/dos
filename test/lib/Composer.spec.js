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

  it('throws error if schema is missing in schemas', () => {
    const schemas = Composer.loadSchemas(schemasPath)
    schemas['NoSchema'] = undefined
    expect(() => Composer.validateSchemas(schemas, 'Schemas'))
      .to.throw('Schema `NoSchema` is not defined')
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

  it('throws Error if declared "componentAction" is missing', () => {
    class NoResourceOperation extends Operation {
    }

    class DeactivateUserProfile extends Operation {
      static get Component() {
        return UserProfile
      }

      static get componentAction() {
        return 'deactivate'
      }
    }

    const operations = [ NoResourceOperation, DeactivateUserProfile ]
    expect(() => new Composer(schemasPath, { components, operations })).to
      .throw('Operation "DeactivateUserProfile" expects component action' +
        ' method "UserProfile.deactivate(context, ...)" to be defined')
  })
})

describe('.validate(schemaId, object)', () => {
  it('validates object using schema', () => {
    const composer = new Composer(schemasPath, { components })

    const userProfile = {
      id: 'USER_PROFILE_ID',
      firstName: 'Alexander',
      lastName:  'Kravets',
      createdAt: new Date().toJSON()
    }

    composer.validate('UserProfile', userProfile)
  })

  it('throws Error if schema is not registered', () => {
    const composer = new Composer(schemasPath, {})
    try {
      composer.validate('UserProperties', {})

    } catch (error) {
      expect(error).to.have.property('message', 'UserProperties schema is not registered')

      return
    }

    throw new Error('Validation exception has not been thrown')
  })

  it('throws ValidationError if object is not valid', () => {
    const composer = new Composer(schemasPath, { components })

    const userProfile = {
      firstName: 'Alexander'
    }

    try {
      composer.validate('UserProfile', userProfile)

    } catch (error) {
      expect(error.code).to.equal('ValidationError')
      expect(error.schemaId).to.equal('UserProfile')
      expect(error.validationErrors[0]).to.have.property('code', 'OBJECT_MISSING_REQUIRED_PROPERTY')

      return
    }

    throw new Error('Validation exception has not been thrown')
  })
})

describe('.validateInput(schemaId, object)', () => {
  it('does cleanup, populates value types, populates default values, validates', () => {
    const input = {
      id: 'ID',
      mutation: {
        firstName: 'Alexander',
        lastName:  'Kravets',
        age:       '32',
        extra:     'TO BE REMOVED'
      }
    }

    composer.validateInput('CreateUserProfileInput', input)

    expect(input.mutation).to.include({ age: 32, gender: 'Male' })
    expect(input.mutation).to.not.include.key('extra')
  })
})

describe('.validateOutput(schemaId, object)', () => {
  it('does cleanup, validates', () => {
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

    composer.validateOutput('CreateUserProfileOutput', output)

    expect(output.data).to.not.include.key('extra')
  })
})

describe('.spec', () => {
  it('returns specification', () => {
    expect(composer.spec).to.be.not.undefined
    composer.validateSpec()
  })
})

describe('.validateSpec()', () => {
  it('validates specification', () => {
    composer.validateSpec()
  })
})

describe('.config', () => {
  it('returns config', () => {
    expect(composer.config).to.be.not.undefined
  })
})

describe('.operations', () => {
  it('returns operations', () => {
    expect(composer.operations).to.be.not.undefined
  })
})

describe('.components', () => {
  it('returns components', () => {
    expect(composer.components).to.be.not.undefined
  })
})
