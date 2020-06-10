'use strict'

const Memory                = require('test/storage/Memory')
const { expect }            = require('chai')
const { Schema, Validator } = require('@kravc/schema')
const { Operation, Document, Create, Read, Update, Index, Delete } = require('src')

class Profile extends Memory(Document) {}
Profile.schema = Schema.loadSync('test/schemas/Profile.yaml')

describe('Operation', () => {
  describe('Operation.constructor(context)', () => {
  })

  describe('Operation.id', () => {
    it('throws error if operation ID is undefined', () => {
      const InvalidOperation = () => class extends Operation {}
      expect(() => InvalidOperation().id).to.throw('Operation ID is undefined')
    })
  })

  describe('Helpers', () => {
    describe('Create(Component, componentAction = \'create\')', () => {
      it('returns "Create" operation class', () => {
        const CreateProfile = Create(Profile)

        expect(CreateProfile.id).eql('CreateProfile')
        expect(CreateProfile.Component).eql(Profile)
        expect(CreateProfile.componentAction).eql('create')

        expect(CreateProfile.tags).to.include('Profiles')
        expect(CreateProfile.summary).eql('Create profile')
        expect(CreateProfile.description).to.be.empty

        expect(CreateProfile.inputSchema.id).eql('CreateProfileInput')
        expect(CreateProfile.inputSchema.source).to.deep.eql({
          mutation: {
            $ref: 'CreateProfileInputMutation',
            required: true
          }
        })

        expect(CreateProfile.mutationSchema.id).to.eql('CreateProfileInputMutation')
        expect(CreateProfile.mutationSchema.source).to.deep.eql({
          id: {
            required: true,
            type: 'string'
          },
          name: {
            type: 'string'
          }
        })

        expect(CreateProfile.outputSchema.id).to.eql('CreateProfileOutput')
        expect(CreateProfile.outputSchema.source).to.deep.eql({
          data: {
            $ref: 'Profile',
            required: true
          }
        })

        expect(CreateProfile.errors.InvalidInputError.statusCode).eql(400)
        expect(CreateProfile.errors.InvalidOutputError.statusCode).eql(500)
        expect(CreateProfile.errors.ResourceExistsError.statusCode).eql(422)
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Create()).to.throw('Argument "Component" is undefined')
      })
    })

    describe('Read(Component, componentAction = \'read\')', () => {
      it('returns "Read" operation class', () => {
        const ReadProfile = Read(Profile)

        expect(ReadProfile.id).eql('ReadProfile')
        expect(ReadProfile.Component).eql(Profile)
        expect(ReadProfile.componentAction).eql('read')

        expect(ReadProfile.tags).to.include('Profiles')
        expect(ReadProfile.summary).eql('Read profile')
        expect(ReadProfile.description).to.be.empty

        expect(ReadProfile.inputSchema.id).eql('ReadProfileInput')
        expect(ReadProfile.inputSchema.source).to.deep.eql({
          id: {
            description: 'Profile ID',
            required: true,
            type: 'string'
          }
        })

        expect(ReadProfile.outputSchema.id).to.eql('ReadProfileOutput')
        expect(ReadProfile.outputSchema.source).to.deep.eql({
          data: {
            $ref: 'Profile',
            required: true
          }
        })

        expect(ReadProfile.mutationSchema).to.eql(null)

        expect(ReadProfile.errors.InvalidInputError.statusCode).eql(400)
        expect(ReadProfile.errors.InvalidOutputError.statusCode).eql(500)
        expect(ReadProfile.errors.ResourceNotFoundError.statusCode).eql(404)
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Read()).to.throw('Argument "Component" is undefined')
      })
    })

    describe('Update(Component, componentAction = \'update\')', () => {
      it('returns "Update" operation class', () => {
        const UpdateProfile = Update(Profile)

        expect(UpdateProfile.id).eql('UpdateProfile')
        expect(UpdateProfile.Component).eql(Profile)
        expect(UpdateProfile.componentAction).eql('update')

        expect(UpdateProfile.tags).to.include('Profiles')
        expect(UpdateProfile.summary).eql('Update profile')
        expect(UpdateProfile.description).to.be.empty

        expect(UpdateProfile.inputSchema.id).eql('UpdateProfileInput')
        expect(UpdateProfile.inputSchema.source).to.deep.eql({
          id: {
            description: 'Profile ID',
            required: true,
            type: 'string'
          },
          mutation: {
            $ref: 'UpdateProfileInputMutation',
            required: true
          }
        })

        expect(UpdateProfile.mutationSchema.id).to.eql('UpdateProfileInputMutation')
        expect(UpdateProfile.mutationSchema.source).to.deep.eql({
          id: {
            type: 'string'
          },
          name: {
            type: 'string'
          }
        })

        expect(UpdateProfile.outputSchema.id).to.eql('UpdateProfileOutput')
        expect(UpdateProfile.outputSchema.source).to.deep.eql({
          data: {
            $ref: 'Profile',
            required: true
          }
        })

        expect(UpdateProfile.errors.InvalidInputError.statusCode).eql(400)
        expect(UpdateProfile.errors.InvalidOutputError.statusCode).eql(500)
        expect(UpdateProfile.errors.ResourceNotFoundError.statusCode).eql(404)
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Update()).to.throw('Argument "Component" is undefined')
      })
    })

    describe('Delete(Component, componentAction = \'delete\')', () => {
      it('returns "Delete" operation class', () => {
        const DeleteProfile = Delete(Profile)

        expect(DeleteProfile.id).eql('DeleteProfile')
        expect(DeleteProfile.Component).eql(Profile)
        expect(DeleteProfile.componentAction).eql('delete')

        expect(DeleteProfile.tags).to.include('Profiles')
        expect(DeleteProfile.summary).eql('Delete profile')
        expect(DeleteProfile.description).to.be.empty

        expect(DeleteProfile.query.id).to.exist
        expect(DeleteProfile.outputSchema).eql(null)
        expect(DeleteProfile.mutationSchema).eql(null)

        expect(DeleteProfile.errors.InvalidInputError.statusCode).eql(400)
        expect(DeleteProfile.errors.ResourceNotFoundError.statusCode).eql(404)
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Delete()).to.throw('Argument "Component" is undefined')
      })
    })

    describe('Index(Component, componentAction = \'index\')', () => {
      it('returns "Index" operation class', () => {
        const IndexProfiles = Index(Profile)

        expect(IndexProfiles.id).eql('IndexProfiles')
        expect(IndexProfiles.Component).eql(Profile)
        expect(IndexProfiles.componentAction).eql('index')

        expect(IndexProfiles.tags).to.include('Profiles')
        expect(IndexProfiles.summary).eql('Index profiles')
        expect(IndexProfiles.description).to.be.empty

        expect(IndexProfiles.inputSchema.id).to.eql('IndexProfilesInput')
        expect(IndexProfiles.inputSchema.source).to.deep.eql({
          limit: {
            description: 'Limit number of profiles to be returned',
            type: 'integer',
            default: 20
          },
          sort: {
            description: 'Sort direction',
            enum: [ 'asc', 'desc' ],
            default: 'desc',
            type: 'string'
          },
          exclusiveStartKey: {
            description: 'Return profiles starting from specific key',
            type: 'string'
          }
        })

        expect(IndexProfiles.outputSchema.id).to.eql('IndexProfilesOutput')
        expect(IndexProfiles.outputSchema.source).to.deep.eql({
          data: {
            items: {
              $ref: 'Profile'
            },
            required: true,
            type: 'array'
          },
          pageInfo: {
            required: true,
            properties: {
              exclusiveStartKey: {
                description: 'Exclusive start key specified in the request',
                type: 'string'
              },
              lastEvaluatedKey: {
                description: 'Last evaluated key to get next portion of results',
                type: 'string'
              },
              limit: {
                description: 'Limit value specified in the request',
                type: 'integer'
              },
              count: {
                description: 'Number of results',
                type: 'integer'
              },
              sort: {
                description: 'Sort direction',
                enum: [ 'asc', 'desc' ],
                type: 'string'
              }
            },
            type: 'object'
          }
        })

        expect(IndexProfiles.mutationSchema).to.eql(null)

        expect(IndexProfiles.errors.InvalidInputError.statusCode).eql(400)
        expect(IndexProfiles.errors.InvalidOutputError.statusCode).eql(500)
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Index()).to.throw('Argument "Component" is undefined')
      })

      describe('.exec(_parameters)', () => {
        const validator = new Validator([ Profile.schema ])
        const identity  = { accountId: 'ACCOUNT_ID' }
        const context   = { validator, identity }

        it('returns operation execution result', async () => {
          Profile.reset()

          const CreateProfile = Create(Profile)
          const IndexProfiles = Index(Profile)

          await (new CreateProfile(context)).exec({ mutation: { name: 'Margarita' } })
          await (new CreateProfile(context)).exec({ mutation: { name: 'Veronica' } })
          await (new CreateProfile(context)).exec({ mutation: { name: 'Dasha' } })

          const operation  = new IndexProfiles(context)
          const { result } = await operation.exec({ sort: 'asc', limit: 20 })

          expect(result.data).to.have.lengthOf(3)
          expect(result.pageInfo.sort).to.eql('asc')
          expect(result.pageInfo.count).to.eql(3)
          expect(result.pageInfo.limit).to.eql(20)
        })
      })
    })
  })
})
