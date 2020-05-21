'use strict'

const Profile       = require('./components/Profile')
const { expect }    = require('chai')
const { Validator } = require('@kravc/schema')

describe('Component', () => {
  const validator = new Validator([ Profile.schema ])

  const attributes = {
    id:   'PROFILE_ID',
    name: 'Oleksandr'
  }

  describe('Component.constructor(context = {}, attributes = {})', () => {
    it('creates component', () => {
      const profile = new Profile({ validator }, attributes)

      expect(profile.id).to.eql('PROFILE_ID')
      expect(profile.componentId).to.eql('Profile')
    })

    it('throw error if validator undefined', () => {
      expect(
        () => new Profile()
      ).to.throw('Validator is undefined for "Profile:null"')
    })
  })

  describe('.context', () => {
    it('returns component instance context', () => {
      const profile = new Profile({ validator }, attributes)
      expect(profile.context.validator).to.exist
    })
  })

  describe('.validate()', () => {
    it('validates JSON instance of the component', () => {
      const profile = new Profile({ validator }, attributes)
      profile.validate()
    })

    it('throw error if validation fails', () => {
      const profile = new Profile({ validator }, { ...attributes, id: null })

      expect(
        () => profile.validate()
      ).to.throw('"Profile" validation failed')
    })
  })
})
