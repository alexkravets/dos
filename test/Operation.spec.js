'use strict'

const Memory     = require('test/storage/Memory')
const { Schema } = require('@kravc/schema')
const { expect } = require('chai')
const { Operation, Document, Create, Read, Update, Index, Delete } = require('src')

class Profile extends Memory(Document) {}
Profile.schema = Schema.loadSync('test/schemas/Profile.yaml')

describe('Operation', () => {
  describe('Operation.constructor(context)', () => {
  })

  describe('Operation.id', () => {
    it('throws error if operation ID is undefined', () => {
      const InvalidOperation = () => class extends Operation {}
      expect(
        () => console.log(InvalidOperation().id)
      ).to.throw('Operation ID is undefined')
    })
  })

  describe('Helpers', () => {
    describe('Create(Component, componentAction = \'create\')', () => {
      it('returns "Create" operation class', () => {
        const CreateProfile = Create(Profile)

        expect(CreateProfile.id).eql('CreateProfile')
      })
    })

    describe('Read(Component, componentAction = \'read\')', () => {
      it('returns "Read" operation class', () => {
        const ReadProfile = Read(Profile)

        expect(ReadProfile.id).eql('ReadProfile')
      })
    })

    describe('Update(Component, componentAction = \'update\')', () => {
      it('returns "Update" operation class', () => {
        const UpdateProfile = Update(Profile)

        expect(UpdateProfile.id).eql('UpdateProfile')
      })
    })

    describe('Index(Component, componentAction = \'index\')', () => {
      it('returns "Index" operation class', () => {
        const IndexProfiles = Index(Profile)

        expect(IndexProfiles.id).eql('IndexProfiles')
      })
    })

    describe('Delete(Component, componentAction = \'delete\')', () => {
      it('returns "Delete" operation class', () => {
        const DeleteProfile = Delete(Profile)

        expect(DeleteProfile.id).eql('DeleteProfile')
        console.log(
          DeleteProfile.Component,
          DeleteProfile.componentAction,
          DeleteProfile.type,
          DeleteProfile.errors,
          DeleteProfile.query,
          DeleteProfile.output,
        )
      })
    })
  })
})
