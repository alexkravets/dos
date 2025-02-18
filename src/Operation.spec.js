'use strict'

const loadSync      = require('./helpers/loadSync')
const { expect }    = require('chai')
const { Validator } = require('@kravc/schema')

const {
  Read,
  Index,
  Create,
  Update,
  Delete,
  Document,
  Component,
  Operation
} = require('src')

class Profile extends Document {}
Profile.schema = loadSync('examples/Profile.yaml')

const validator = new Validator([ Profile.schema ])
const identity  = { sub: 'USER_ID' }
const DEFAULT_CONTEXT = { validator, identity }

describe('Operation', () => {
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

        expect(CreateProfile.errors.DocumentExistsError.statusCode).eql(422)
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

        expect(ReadProfile.errors.DocumentNotFoundError.statusCode).eql(404)
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Read()).to.throw('Argument "Component" is undefined')
      })

      describe('.exec(_parameters)', () => {
        it('triggers "componentActionMethod" without mutation parameter', async () => {
          Profile.reset()

          const CreateProfile = Create(Profile)
          const ReadProfiles  = Read(Profile)

          const { result: { data: { id } } } = await (
            new CreateProfile(DEFAULT_CONTEXT)).exec({ mutation: { name: 'Taras' } }
          )

          const operation  = new ReadProfiles(DEFAULT_CONTEXT)
          const { result } = await operation.exec({ id })

          expect(result.data).to.exist
        })
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

        expect(UpdateProfile.errors.DocumentNotFoundError.statusCode).eql(404)
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

        expect(DeleteProfile.errors.DocumentNotFoundError.statusCode).eql(404)
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
      })

      it('throws error if "Component" argument is undefined', () => {
        expect(() => Index()).to.throw('Argument "Component" is undefined')
      })

      describe('.exec(_parameters)', () => {
        it('returns operation execution result', async () => {
          Profile.reset()

          const CreateProfile = Create(Profile)
          const IndexProfiles = Index(Profile)

          await (new CreateProfile(DEFAULT_CONTEXT)).exec({ mutation: { name: 'Margarita' } })
          await (new CreateProfile(DEFAULT_CONTEXT)).exec({ mutation: { name: 'Veronica' } })
          await (new CreateProfile(DEFAULT_CONTEXT)).exec({ mutation: { name: 'Dasha' } })

          const operation  = new IndexProfiles(DEFAULT_CONTEXT)
          const { result } = await operation.exec({ sort: 'asc', limit: 20 })

          expect(result.data).to.have.lengthOf(3)
          expect(result.pageInfo.sort).to.eql('asc')
          expect(result.pageInfo.count).to.eql(3)
          expect(result.pageInfo.limit).to.eql(20)
        })
      })
    })
  })

  describe('Operation.id', () => {
    it('throws error if operation ID is undefined', () => {
      const InvalidOperation = () => class extends Operation {}
      expect(() => InvalidOperation().id).to.throw('Operation ID is undefined')
    })
  })

  describe('Operation.tags', () => {
    it('returns empty list by default', () => {
      expect(Operation.tags).to.be.empty
    })
  })

  describe('Operation.summary', () => {
    it('returns empty string by default', () => {
      expect(Operation.summary).to.be.empty
    })
  })

  describe('Operation.security', () => {
    it('returns no requirements by default', () => {
      const CreateProfile = Create(Profile)
      expect(CreateProfile.security).to.be.empty
    })
  })

  describe('Operation.inputSchema', () => {
    it('returns null for operations without query and mutation', () => {
      const Test = class extends Operation {}
      expect(Test.inputSchema).to.be.null
    })
  })

  describe('Operation.errors', () => {
    it('does not include "InvalidInputError" for operation without input schema', () => {
      const Test = class extends Operation {}
      expect(Test.errors.InvalidInputError).to.not.exist
    })
  })

  describe('Operation.mutation', () => {
    it('uses "schema" for components without "bodySchema"', () => {
      class RemoteProfile extends Component {}
      RemoteProfile.schema = loadSync('examples/Profile.yaml')

      const CreateRemoteProfile = Create(RemoteProfile)
      expect(CreateRemoteProfile.mutation).to.exist
    })
  })

  describe('Operation.output', () => {
    it('returns null for operations without component', () => {
      const Test = class extends Operation {}
      expect(Test.output).to.be.null
    })
  })

  describe('Operation.componentActionMethod', () => {
    it('throws error if component is undefined', () => {
      class TestOperation extends Operation {}
      expect(() => TestOperation.componentActionMethod)
        .to.throw('Operation "TestOperation" expects')
    })

    it('throws error if component action is undefined', () => {
      class TestOperation extends Operation {
        static get Component() {
          return Profile
        }

        static get componentAction() {
          return 'destroy'
        }
      }
      expect(() => TestOperation.componentActionMethod)
        .to.throw('Operation "TestOperation" expects component action method' +
          ' "Profile.destroy(context, ...)" to be defined')
    })
  })

  describe('.setHeader(name, value)', () => {
    it('adds header to the operation response', async () => {
      const CreateProfile = class extends Create(Profile) {
        after() {
          this.setHeader('x-response-time', 100)
        }
      }

      const { headers, result: { data: profile } } = await (
        new CreateProfile(DEFAULT_CONTEXT)
      ).exec({ mutation: { name: 'Oleksandr' } })

      expect(headers).to.include({ 'x-response-time': 100 })
      expect(profile.attributes.name).to.eql('Oleksandr')
    })
  })

  describe('.before(parameters)', () => {
    it('allows to modify parameters before action', async () => {
      const CreateProfile = class extends Create(Profile) {
        before(parameters) {
          parameters.mutation.lastName = 'Kravets'
          return parameters
        }
      }

      const { result: { data: profile } } = await (
        new CreateProfile(DEFAULT_CONTEXT)
      ).exec({ mutation: { name: 'Oleksandr' } })

      expect(profile.attributes.lastName).to.eql('Kravets')
    })

    it('supports passthrough execution, when parameters are not changed', async () => {
      const CreateProfile = class extends Create(Profile) {
        before() {
          this.setHeader('set-cookie', [ 'a=1', 'b=2' ], true)
        }
      }

      const { multiValueHeaders, result: { data: profile } } = await (
        new CreateProfile(DEFAULT_CONTEXT)
      ).exec({ mutation: { name: 'Oleksandr' } })

      expect(multiValueHeaders['set-cookie']).to.exist
      expect(multiValueHeaders['set-cookie']).to.have.lengthOf(2)
      expect(profile.attributes.name).to.eql('Oleksandr')
    })
  })

  describe('.after(parameters, result)', () => {
    it('allows to modify after action response', async () => {
      const CreateProfile = class extends Create(Profile) {
        after(parameters, profile) {
          profile.attributes.lastName = 'Kravets'
          return profile
        }
      }

      const { result: { data: profile } } = await (
        new CreateProfile(DEFAULT_CONTEXT)
      ).exec({ mutation: { name: 'Oleksandr' } })

      expect(profile.attributes.lastName).to.eql('Kravets')
    })

    it('supports non-data attribute in result', async () => {
      const Health = class extends Operation {
        action() {
          return { status: 'OK' }
        }

        after(parameters, result) {
          return { ...result, service: 'Test' }
        }
      }

      const { result } = await (new Health(DEFAULT_CONTEXT)).exec()
      expect(result).to.deep.eql({ status: 'OK', service: 'Test' })
    })
  })

  describe('.action()', () => {
    it('supports dummy mode without defined "Component"', async () => {
      const { result } = await new Operation().exec()

      expect(result).to.be.empty
    })
  })
})
