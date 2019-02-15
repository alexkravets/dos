'use strict'

const Schema     = require('lib/Schema')
const { expect } = require('chai')

const profileSchemaSource = {
  name: { type: 'string', required: true },
  gender: {
    type: 'string',
    enum: [ 'Male', 'Female' ],
    default: 'Male'
  },
  preferences: {
    required:   true,
    type:       'object',
    properties: {
      email:        { type: 'string', required: true },
      mobileNumber: { type: 'string' },
      addresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            line1: { type: 'string' },
            line2: { type: 'string' }
          }
        }
      }
    }
  },
  tags: {
    type:  'array',
    items: {
      type: 'string'
    }
  }
}

const genderSchemaSource = {
  type: 'string',
  enum: [ 'male', 'female' ]
}

describe('Schema.constructor(schemaId, source)', () => {
  it('creates new schema from simple source', () => {
    const schema = new Schema('Profile', profileSchemaSource)

    expect(schema.id).to.equal('Profile')
    expect(schema.source).to.deep.equal(profileSchemaSource)
  })
})

describe('.enum', () => {
  it('returns enum values', () => {
    const schema = new Schema('Gender', genderSchemaSource)

    expect(schema.enum).to.deep.equal(genderSchemaSource.enum)
  })
})

describe('.jsonSchema', () => {
  it('returns JSON schema', () => {
    const schema = new Schema('Profile', profileSchemaSource)

    expect(schema.jsonSchema).to.have.property('type', 'object')
    expect(schema.jsonSchema).to.have.property('properties')
    expect(schema.jsonSchema.required).to.deep.equal([ 'name', 'preferences' ])
    expect(schema.jsonSchema.properties.preferences.required).to.deep.equal([ 'email' ])
  })

  it('returns JSON schema for partial', () => {
    const schema = new Schema('Gender', genderSchemaSource)

    expect(schema.jsonSchema).to.have.property('type', 'string')
    expect(schema.jsonSchema).to.have.property('enum')
  })
})

describe('.clone(schemaId)', () => {
  it('clones schema source', () => {
    const genderSchema = new Schema('Gender', genderSchemaSource)
    const schema = genderSchema.clone('ClonedGender')

    expect(schema.source).to.deep.equal(genderSchema.source)
  })
})

describe('.clone(schemaId, { only })', () => {
  it('clones schema specific fields', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('ClonedProfile', { only: 'name' })

    expect(schema.jsonSchema.required).to.deep.equal([ 'name' ])
    const propertyNames = Object.keys(schema.jsonSchema.properties)
    expect(propertyNames).to.deep.equal([ 'name' ])
  })
})

describe('.clone(schemaId, { skip })', () => {
  it('clones schema skipping specific fields', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('ClonedProfile', {
      skip: [ 'gender', 'preferences.email' ]
    })

    expect(schema.jsonSchema.required).to.deep.equal([ 'name', 'preferences' ])
    const propertyNames = Object.keys(schema.jsonSchema.properties)
    expect(propertyNames).to.deep.equal([ 'name', 'preferences', 'tags' ])

    expect(schema.jsonSchema.properties.preferences.properties.email).to.be.undefined
  })
})

describe('.clone(schemaId, { isUpdate })', () => {
  it('clones schema with no required flag and no default values', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('ClonedProfile', { isUpdate: true })

    expect(schema.jsonSchema.required).to.be.undefined
    expect(schema.source.gender.required).to.be.undefined
    expect(schema.source.gender.default).to.be.undefined
    expect(schema.source.preferences.required).to.be.undefined
  })
})

describe('.clone(schemaId, { extend })', () => {
  it('clones schema and extends with properties', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('ClonedProfile', {
      only: [ 'name' ],
      extend: {
        avatarUrl: { type: 'string', required: true }
      }
    })

    expect(schema.jsonSchema.required).to.deep.equal([ 'name', 'avatarUrl' ])
    expect(schema.source).to.have.property('avatarUrl')
  })
})

describe('.cleanup(object, schemas = {})', () => {
  const genderSchemaSource = {
    type: 'string',
    enum: [ 'male', 'female' ]
  }

  const profilePreferencesSchemaSource = {
    email:        { type: 'string', required: true },
    mobileNumber: { type: 'string' },
    addresses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          line1: { type: 'string' },
          line2: { type: 'string' }
        }
      }
    }
  }

  const profileSchemaSource = {
    name: { type: 'string', required: true },
    gender: {
      $ref: 'Gender'
    },
    preferences: {
      required: true,
      $ref: 'ProfilePreferences'
    },
    tags: {
      type:  'array',
      items: 'string'
    },
    appointments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          startsAt: {
            type:   'string',
            format: 'date-time'
          }
        }
      }
    }
  }

  it('removes object properties that are not defined in schemas', () => {
    const schemas = {
      Gender:  new Schema('Gender', genderSchemaSource),
      Profile: new Schema('Profile', profileSchemaSource),
      ProfilePreferences: new Schema('ProfilePreferences', profilePreferencesSchemaSource)
    }

    const profile = {
      name:   'Alexander Kravets',
      gender: 'Male',
      sex:    'Male',
      preferences: {
        mobileNumber: '+380504112177',
        email1:       'alex@slatestudio.com'
      },
      appointments: [{
        startsAt: new Date().toJSON(),
        endsAt:   new Date().toJSON()
      }]
    }

    schemas.Profile.cleanup(profile, schemas)

    expect(profile.name).to.equal('Alexander Kravets')
    expect(profile.gender).to.equal('Male')
    expect(profile.preferences.mobileNumber).to.equal('+380504112177')

    expect(profile.sex).to.be.undefined
    expect(profile.preferences.email1).to.be.undefined
    expect(profile.appointments[0]).to.not.have.property('endsAt')
  })

  it('cleanups schemas without referenced schemas', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('MiniProfile', { only: [ 'name', 'tags' ] })

    const profile = {
      name:   'Alexander Kravets',
      gender: 'Male',
      sex:    'Male',
      preferences: {
        mobileNumber: '+380504112177',
        email1:       'alex@slatestudio.com'
      },
      tags: [ 'tag1' ]
    }

    schema.cleanup(profile)
    const profileFieldNames = Object.keys(profile)

    expect(profileFieldNames).to.deep.equal([ 'name', 'tags' ])
    expect(profile.sex).to.be.undefined
    expect(profile.preferences).to.be.undefined
    expect(profile.gender).to.be.undefined
  })

  it('throws Error if referenced schema is missing', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('MiniProfile', { only: [ 'name', 'gender' ] })

    expect(() => schema.cleanup({ gender: 'Male' }))
      .to.throw('Schema MiniProfile is referensing missing schema Gender')
  })

  it('throws Error if referenced schema is missing in for array item', () => {
    const profileSchema = new Schema('Profile', profileSchemaSource)
    const schema = profileSchema.clone('MiniProfile', {
      only: [ 'name' ],
      extend: {
        arrayWithBrokenReference: {
          type:  'array',
          items: {
            $ref: 'Gender'
          }
        }
      }
    })

    expect(() => schema.cleanup({
      name: 'Alexander',
      arrayWithBrokenReference: [ 'Male' ]
    })).to.throw('Schema MiniProfile.arrayWithBrokenReference is referensing missing schema Gender')
  })
})

describe('.populateValueTypes(object, schemas = {})', () => {
  const profilePreferencesSchemaSource = {
    age:          { type: 'number' },
    email:        { type: 'string' },
    shoeSize:     { type: 'integer' },
    isEnabled:    { type: 'boolean' },
    mobileNumber: { type: 'string' }
  }

  const profileSchema = new Schema('Profile', profileSchemaSource)

  it('populates object properties types according to schemas', () => {
    const schemas = {
      Gender:             new Schema('Gender', genderSchemaSource),
      ProfilePreferences: new Schema('ProfilePreferences', profilePreferencesSchemaSource),
      Profile: profileSchema.clone('Profile', {
        extend: {
          gender:      { $ref: 'Gender' },
          preferences: { $ref: 'ProfilePreferences' },
          preferencesHistory: {
            type: 'array',
            items: {
              $ref: 'ProfilePreferences'
            }
          }
        }
      })
    }

    let object

    object = {
      gender: 'Male',
      preferences: {
        isEnabled: '0',
        shoeSize:  '40',
        age:       'NaN'
      },
      preferencesHistory: [{
        isEnabled: '0',
        shoeSize:  '40',
        age:       'NaN'
      }]
      // TODO: Add nested definitions for object and array
    }

    schemas.Profile.populateValueTypes(object, schemas)

    expect(object.preferences).to.include({ shoeSize: 40, age: 'NaN' })
    expect(object.preferences).to.include({ isEnabled: false })
    expect(object.preferencesHistory[0]).to.include({ shoeSize: 40, age: 'NaN' })
    expect(object.preferencesHistory[0]).to.include({ isEnabled: false })

    object.preferences.isEnabled = 'false'
    schemas.Profile.populateValueTypes(object, schemas)
    expect(object.preferences).to.include({ isEnabled: false })

    object.preferences.isEnabled = '1'
    schemas.Profile.populateValueTypes(object, schemas)
    expect(object.preferences).to.include({ isEnabled: true })

    object.preferences.isEnabled = 'true'
    schemas.Profile.populateValueTypes(object, schemas)
    expect(object.preferences).to.include({ isEnabled: true })

    object.preferences.isEnabled = true
    schemas.Profile.populateValueTypes(object, schemas)
    expect(object.preferences).to.include({ isEnabled: true })

    object.preferences.isEnabled = 1
    schemas.Profile.populateValueTypes(object, schemas)
    expect(object.preferences).to.include({ isEnabled: true })
  })

  it('throws Error if referenced schema is missing', () => {
    const schema = profileSchema.clone('MiniProfile', {
      only:   [ 'name', 'gender' ],
      extend: {
        gender: { $ref: 'Gender' }
      }
    })

    expect(() => schema.populateValueTypes({ gender: 'Male' }))
      .to.throw('"MiniProfile.gender.$ref" is referensing missing schema "Gender"')
  })
})

describe('.populateDefaultValues(object, schemas = {})', () => {
  const profilePreferencesSchemaSource = {
    shoeSize:     { type: 'integer', default: 42 },
    isEnabled:    { type: 'boolean', default: false },
    mobileNumber: { type: 'string',  default: 'N/A' }
  }

  const profileSchema = new Schema('Profile', profileSchemaSource)

  it('populates object properties values with defaults specified in schemas', () => {
    const schemas = {
      Gender:             new Schema('Gender', genderSchemaSource),
      ProfilePreferences: new Schema('ProfilePreferences', profilePreferencesSchemaSource),
      Profile: profileSchema.clone('Profile', {
        extend: {
          gender:      { $ref: 'Gender', default: 'Male' },
          preferences: { $ref: 'ProfilePreferences' },
          preferencesHistory: {
            type: 'array',
            items: {
              $ref: 'ProfilePreferences'
            }
          },
          meta: {
            type:       'object',
            properties: {
              weight: {
                type: 'integer'
              },
              kind: {
                type:    'string',
                default: 'default'
              },
              extra: {
                type:    'object',
                default: {}
              }
            }
          },
          tags: {
            type:  'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                value: {
                  type:    'string',
                  default: 'none'
                }
              }
            }
          }
        }
      })
    }

    let object = {
      preferencesHistory: [{}],
      preferences:        {},
      meta:               { weight: 500 },
      tags:               [{ name: 'tag1' }, { name: 'tag2' }]
    }

    schemas.Profile.populateDefaultValues(object, schemas)

    expect(object.gender).to.equal('Male')
    expect(object.preferences.shoeSize).to.equal(42)
    expect(object.preferences.isEnabled).to.equal(false)
    expect(object.preferences.mobileNumber).to.equal('N/A')
    expect(object.preferences.mobileNumber).to.equal('N/A')
    expect(object.preferencesHistory[0].shoeSize).to.equal(42)
    expect(object.preferencesHistory[0].isEnabled).to.equal(false)
    expect(object.preferencesHistory[0].mobileNumber).to.equal('N/A')
    expect(object.preferencesHistory[0].mobileNumber).to.equal('N/A')
    expect(object.meta.weight).to.equal(500)
    expect(object.meta.kind).to.equal('default')
    expect(object.meta.extra).to.be.an('object').that.is.empty
    expect(object.tags[0].value).to.equal('none')
    expect(object.tags[1].value).to.equal('none')

    object = { gender: 'Male' }
    schemas.Profile.populateDefaultValues(object, schemas)
  })

  it('throws Error if referenced schema is missing', () => {
    const schema = profileSchema.clone('Profile', {
      only:   [ 'name', 'preferences' ],
      extend: {
        preferences: { $ref: 'ProfilePreferences' }
      }
    })

    expect(() => schema.populateDefaultValues({ preferences: {} }))
      .to.throw('"Profile.preferences.$ref" is referensing missing schema' +
        ' "ProfilePreferences"')
  })

  it('throws Error if referenced schema is missing inside of inline array definition', () => {
    const schema = profileSchema.clone('Profile', {
      only:   [ 'name' ],
      extend: {
        preferencesHistory: {
          type: 'array',
          items: {
            $ref: 'ProfilePreferences'
          }
        }
      }
    })

    expect(() => schema.populateDefaultValues({ preferencesHistory: [{}] }))
      .to.throw('"Profile.preferencesHistory.items.$ref" is referensing' +
        ' missing schema "ProfilePreferences"')
  })
})

describe('.validate(object, schemas = {})', () => {
  const profileSchema = new Schema('Profile', profileSchemaSource)

  it('throws ValidationError if object is not valid', async() => {
    const object = {}
    try {
      await profileSchema.validate(object)

    } catch (error) {
      expect(error.code).to.equal('ValidationError')
      expect(error.schemaId).to.equal('Profile')
      expect(error.object).to.deep.equal(object)
      expect(error.validationErrors[0].params).to.deep.equal([ 'preferences' ])
      expect(error.validationErrors[1].params).to.deep.equal([ 'name' ])
      return

    }

    throw new Error('Expected exception has not been thrown')
  })

  it('returns nothing if object is valid', async() => {
    const object = {
      name:        'Alexander Kravets',
      preferences: {
        email: 'alex@slatestudio.com'
      }
    }

    await profileSchema.validate(object)
  })
})
