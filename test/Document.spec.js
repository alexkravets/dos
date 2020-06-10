'use strict'

const Memory        = require('test/storage/Memory')
const { Schema }    = require('@kravc/schema')
const { expect }    = require('chai')
const { Document }  = require('src')
const { Validator } = require('@kravc/schema')

class Profile extends Memory(Document) {}
Profile.schema = Schema.loadSync('test/schemas/Profile.yaml')

describe('Document', () => {
  const validator = new Validator([ Profile.schema ])
  const identity  = { accountId: 'ACCOUNT_ID' }
  const context   = { validator, identity }

  let id

  describe('Document.create(context, query, mutation)', () => {
    it('creates document', async () => {
      const profile = await Profile.create(context, { name: 'Oleksandr' })

      expect(profile.id).to.exist
      expect(profile.attributes.name).to.eql('Oleksandr')
      expect(profile.attributes.createdAt).to.exist
      expect(profile.attributes.createdBy).to.exist

      id = profile.id
    })

    it('creates document via mutation', async () => {
      const profile = await Profile.create(context, {}, { name: 'Olga' })

      expect(profile.id).to.exist
      expect(profile.attributes.name).to.eql('Olga')
      expect(profile.attributes.createdAt).to.exist
      expect(profile.attributes.createdBy).to.exist
    })

    it('creates document without identity in context', async () => {
      const profile = await Profile.create({ validator }, { name: 'Oleg' })

      expect(profile.id).to.exist
      expect(profile.attributes.name).to.eql('Oleg')
      expect(profile.attributes.createdAt).to.exist
      expect(profile.attributes.createdBy).to.not.exist
    })
  })

  describe('Document.read(context, query)', () => {
    it('returns document', async () => {
      const profile = await Profile.read(context, { id })

      expect(profile).to.exist
    })
  })

  describe('Document.update(context, query, mutation)', () => {
    it('updates document', async () => {
      await Profile.update(context, { id }, { name: 'Margarita' })

      const profile = await Profile.read(context, { id })

      expect(profile.attributes.name).to.eql('Margarita')
      expect(profile.attributes.updatedAt).to.exist
      expect(profile.attributes.updatedBy).to.exist
    })

    it('updates document without identity in context', async () => {
      const { id } = await Profile.create({ validator }, { mutation: { name: 'Gustav' } })

      const profile = await Profile.update({ validator }, { id, mutation: { name: 'Jack' } })

      expect(profile.attributes.updatedAt).to.exist
      expect(profile.attributes.updatedBy).to.not.exist
    })
  })

  describe('Document.delete(context, query)', () => {
    it('deletes document', async () => {
      await Profile.delete(context, { id })

      try {
        await Profile.read(context, { id })

      } catch (error) {
        expect(error.context).to.exist
        expect(error.code).to.eql('ResourceNotFoundError')

        return
      }

      throw new Error('Document has not been deleted')
    })
  })

  describe('Document.index(context, query)', () => {
    it('returns documents', async () => {
      await Profile.create(context, { name: 'Oleksandr' })
      await Profile.create(context, { name: 'Margarita' })
      await Profile.create(context, { name: 'Veronica' })

      const { objects, count } = await Profile.index(context)

      expect(objects.length).to.eql(6)
      expect(count).to.eql(6)
    })
  })

  describe('Document.bodySchema', () => {
    it('returns document body schema', async () => {
      expect(Profile.bodySchema).to.exist
    })
  })

  describe('.delete()', () => {
    it('deletes document', async () => {
      const profile = await Profile.create(context, { name: 'Oleksandr' })
      const { id }  = profile

      await profile.delete()

      try {
        await Profile.read(context, { id })

      } catch (error) {
        expect(error.context).to.exist
        expect(error.code).to.eql('ResourceNotFoundError')

        return
      }

      throw new Error('Document has not been deleted')
    })
  })

  describe('.update(mutation, shouldMutate = false)', () => {
    it('updates document', async () => {
      const profile = await Profile.create(context, { name: 'Oleksandr' })

      const updatedProfile = await profile.update({ name: 'Anton' })

      expect(profile.attributes.name).to.eql('Oleksandr')
      expect(updatedProfile.attributes.name).to.eql('Anton')
    })

    it('updates and mutates document', async () => {
      const profile = await Profile.create(context, { name: 'Oleksandr' })

      await profile.update({ name: 'Anton' }, true)

      expect(profile.attributes.name).to.eql('Anton')
    })
  })

  describe('before*, after* callbacks', () => {
    it('executes callbacks for create, update and delete mutations', async () => {
      const callbacks = {}

      class CustomProfile extends Profile {
        static beforeCreate(context, mutation) {
          callbacks.beforeCreate = mutation
        }

        static beforeUpdate(context, query, mutation) {
          callbacks.beforeUpdate = mutation
        }

        static beforeDelete(context, query) {
          callbacks.beforeDelete = query
        }

        static afterCreate(context, profile) {
          callbacks.afterCreate = profile
        }

        static afterUpdate(context, query, mutation, profile) {
          callbacks.afterUpdate = profile
        }

        static afterDelete(context, query) {
          callbacks.afterDelete = query
        }
      }

      CustomProfile.schema = Profile.schema.clone('CustomProfile')

      const validator = new Validator([ CustomProfile.schema ])

      const { id } = await CustomProfile.create({ validator }, { name: 'Irina' })
      await CustomProfile.update(context, { id, mutation: { name: 'Maria' } })
      await CustomProfile.delete(context, { id })

      expect(callbacks.beforeCreate).to.exist
      expect(callbacks.afterCreate).to.exist
      expect(callbacks.beforeUpdate).to.exist
      expect(callbacks.afterUpdate).to.exist
      expect(callbacks.beforeDelete).to.exist
      expect(callbacks.afterDelete).to.exist
    })
  })
})
