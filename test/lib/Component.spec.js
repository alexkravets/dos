'use strict'

const Composer   = require('lib/Composer')
const Component  = require('lib/Component')
const { expect } = require('chai')

class UserProfile extends Component {
}

const schemasPath = './test/example/schemas'
const components  = [ UserProfile ]

let composer
before(() => {
  composer = new Composer(schemasPath, { components })
})

describe('Component.schema', () => {
  it('returns schema for the component', () => {
    expect(UserProfile.schema).to.have.property('id', 'UserProfile')
  })
})

describe('Component.constructor(context = {}, attributes = {})', () => {
  it('create new component', () => {
    const attributes = {
      id: 'ID'
    }

    const userProfile = new UserProfile({ composer }, attributes)

    expect(userProfile.componentId).to.equal('UserProfile')
    expect(userProfile.id).to.equal('ID')

    const emptyUserProfile = new UserProfile()
    expect(emptyUserProfile.id).to.be.null
    expect(() => emptyUserProfile.composer).to.throw()
  })
})

describe('.validate()', () => {
  it('validates components JSON object', () => {
    const attributes = {
      id:        'ID',
      firstName: 'Alexander',
      lastName:  'Kravets'
    }

    const userProfile = new UserProfile({ composer }, attributes)
    userProfile.validate()
  })
})
