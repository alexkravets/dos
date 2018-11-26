'use strict'

const chalk      = require('chalk')
const { expect } = require('chai')
const { Profile, Book } = require('test/app/models')

const expectError = async(fn, errorName) => {
  try {
    await fn()

  } catch (error) {
    expect(error.code).to.equal(errorName)
    return

  }

  throw new Error(`Expected error ${errorName} was not thrown`)
}

describe('Dynamo :: Document storage driver', () => {
  before(() => Profile.createCollection())
  after(() => Profile.deleteCollection())

  describe('Dynamo.createCollection()', () => {
    it('creates collection table', async() => {
      await Book.createCollection()
    })

    it('does nothing if collection table already exists', async() => {
      await Book.createCollection()
    })
  })

  describe('Dynamo.deleteCollection()', () => {
    it('removes collection sucessfully', async() => {
      await Book.deleteCollection()
    })
  })

  describe('Dynamo._create(Item)', () => {
    it('creates document', async() => {
      const attributes = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      const { id }  = await Profile.create({}, attributes)
      const profile = await Profile.read({}, { id })

      expect(profile.attributes).to.include(attributes)
    })

    it('throws an error if table does not exist', async() => {
      const attributes = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      await expectError(() => Book.create({}, attributes), 'ResourceNotFoundException')
    })

    it('throws an error if document with the same key to be created', async() => {
      class ModifiedBook extends Book {
        static documentId(attributes) {
          return attributes.firstName
        }

        static get documentSchema() {
          return this.schemas.Book
        }
      }

      const attributes = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      try {
        await ModifiedBook.deleteCollection()

      } catch (error) {
        console.log(chalk`{dim Collection for ModifiedBook does not exists}`)

      }

      await ModifiedBook.createCollection()
      await ModifiedBook.create({}, attributes)
      await expectError(() => ModifiedBook.create({}, attributes), 'DocumentExists')
    })
  })

  describe('Dynamo._index(query, options)', () => {
    it('gets list of documents', async() => {
      const documents = await Profile.index({}, {}, {})

      expect(documents.count).to.equal(1)
    })

    it('gets list of documents with limit 1', async() => {
      const documents = await Profile.index({}, {}, { limit: 1 })

      expect(documents.count).to.equal(1)
      expect(documents.lastEvaluatedKey).not.to.equal(undefined)
      expect(documents.objects.length).to.equal(1)
    })

    it('gets list of documents with sort ascending', async() => {
      const attributes = {
        firstName: 'Dmitry',
        lastName:  'Panchenko'
      }
      await Profile.create({}, attributes)
      const documents = await Profile.index({}, {}, { sort: 'asc' })

      expect(documents.count).to.equal(2)
      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')
      expect(documents.objects[1].attributes.firstName).to.equal('Dmitry')
    })

    it('gets list of documents with sort descending', async() => {
      const documents = await Profile.index({}, {}, { sort: 'desc' })

      expect(documents.objects[0].attributes.firstName).to.equal('Dmitry')
      expect(documents.objects[1].attributes.firstName).to.equal('Alexander')
    })

    it('gets list of documents with sort descending by default', async() => {
      const documents = await Profile.index({}, {}, {})

      expect(documents.objects[0].attributes.firstName).to.equal('Dmitry')
      expect(documents.objects[1].attributes.firstName).to.equal('Alexander')
    })

    it('gets list of documents from second page', async() => {
      const documentsList = await Profile.index({}, {}, { limit: 1 })
      const { lastEvaluatedKey } = documentsList
      const documents = await Profile.index({}, {}, { exclusiveStartKey: lastEvaluatedKey })

      expect(documents.count).to.equal(1)
      expect(documents.lastEvaluatedKey).to.equal(undefined)
      expect(documents.objects.length).to.equal(1)
    })

    it('gets list of documents with query param with empty result on second page', async() => {
      const documents = await Profile.index({}, { firstName: 'Alexander' }, { limit: 1 })
      const { lastEvaluatedKey } = documents
      const secondPage = await Profile.index({}, { firstName: 'Alexander' }, {
        limit: 1,
        exclusiveStartKey: lastEvaluatedKey
      })

      expect(documents.count).to.equal(1)
      expect(documents.lastEvaluatedKey).not.to.equal(undefined)
      expect(documents.objects.length).to.equal(1)
      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')

      expect(secondPage.count).to.equal(0)
    })

    it('gets list of documents with query param with results spread over the table', async() => {
      await Profile.create({}, {
        firstName: 'Alexander',
        lastName:  'Petrov'
      })
      await Profile.create({}, {
        firstName: 'Alexander',
        lastName:  'Ivanot'
      })
      await Profile.create({}, {
        firstName: 'Dmitry',
        lastName:  'Sidorov'
      })
      const documents = await Profile.index({}, { firstName: 'Alexander' }, { limit: 2 })

      expect(documents.count).to.equal(2)
      expect(documents.lastEvaluatedKey).not.to.equal(undefined)
      expect(documents.objects.length).to.equal(2)
      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')
    })


    it('gets list of documents with query param with empty lastEvaluatedKey in result', async() => {
      await Profile.create({}, {
        firstName: 'Alexander',
        lastName:  'Ivanoff'
      })
      await Profile.create({}, {
        firstName: 'Alexander',
        lastName:  'Makedonskiy'
      })
      const documents = await Profile.index({}, { firstName: 'Alexander' }, { limit: 4 })

      expect(documents.count).to.equal(4)
      expect(documents.lastEvaluatedKey).to.be.undefined
      expect(documents.objects.length).to.equal(4)
      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')

    })

    it('gets list of documents with sort descending', async() => {
      const documents = await Profile.index({}, {}, { sort: 'desc' })

      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')
      expect(documents.objects[1].attributes.firstName).to.equal('Alexander')
    })

    it('throws an error if table does not exist', async() => {
      await expectError(() => Book.index({}, {}, {}), 'ResourceNotFoundException')
    })

    it('gets list of documents with parameters for nested query', async() => {
      await Profile._create({
        createdAt: new Date().toJSON(),
        firstName: 'Alexander',
        parameters: {
          shirt: {
            size: 'L'
          }
        }
      })

      await Profile._create({
        createdAt: new Date().toJSON(),
        firstName: 'Dmitry',
        parameters: {
          shirt: {
            size: 'M'
          }
        }
      })

      const documents = await Profile.index({}, { 'parameters.shirt.size': 'M' })

      expect(documents.count).to.equal(1)
      expect(documents.objects.length).to.equal(1)
      expect(documents.objects[0].attributes.firstName).to.equal('Dmitry')
    })

    it('gets list of documents using IN query', async() => {
      await Profile.create({}, {
        firstName: 'Ihor',
        parameters: {
          tshirtSize: 'M'
        }
      })
      await Profile.create({}, {
        firstName: 'Ihor',
        parameters: {
          tshirtSize: 'L'
        }
      })
      await Profile.create({}, {
        firstName: 'Bill',
        parameters: {
          tshirtSize: 'S'
        }
      })

      const documents = await Profile.index({}, { 'parameters.tshirtSize': ['L', 'M'] })

      expect(documents.count).to.equal(2)
      expect(documents.objects.length).to.equal(2)
      expect(documents.objects[0].attributes.parameters.tshirtSize).to.equal('L')
      expect(documents.objects[1].attributes.parameters.tshirtSize).to.equal('M')
    })

    it('gets list of documents using CONTAINS query', async() => {
      await Profile.create({}, {
        firstName: 'Ihor',
        activities: {
          sport: [ 'football' ]
        }
      })
      await Profile.create({}, {
        firstName: 'Ihor',
        activities: {
          sport: [ 'football', 'tennis' ]
        }
      })
      await Profile.create({}, {
        firstName: 'Bill',
        activities: {
          sport: [ 'golf' ]
        }
      })

      const documents = await Profile.index({}, { 'activities.sport:contains': 'football' })

      expect(documents.count).to.equal(2)
      expect(documents.objects.length).to.equal(2)
    })
  })

  describe('Dynamo._read(id)', () => {
    it('reads document', async() => {
      const { objects } = await Profile.index({}, { firstName: 'Alexander' })
      const { id } = objects[0]

      const profile = await Profile.read({}, { id })

      expect(profile.attributes.firstName).to.equal('Alexander')
    })

    it('throws an error if document does not exist', async() => {
      await expectError(() => Profile.read({}, { id: 'PROFILE_ID' }), 'DocumentNotFound')
    })

    it('throws an error if document is not found', async() => {
      await expectError(() => Book.read({}, { id: 'BOOK_ID' }), 'ResourceNotFoundException')
    })
  })

  describe('Dynamo._delete(id)', () => {
    it('flags document as deleted', async() => {
      const { objects } = await Profile.index({}, { firstName: 'Dmitry' })

      const { id } = objects[0]
      await Profile.delete({}, { id })

      const result = await Profile.index({}, { firstName: 'Dmitry' })
      const deletedProfile = result.objects[0]

      expect(deletedProfile.id).to.not.equal(id)
      await expectError(() => Profile.read({}, { id }), 'DocumentNotFound')
      await expectError(() => Profile.update({}, { id }, { firstName: 'Sasha' }), 'DocumentNotFound')
    })

    it('throws an error if table does not exist', async() => {
      await expectError(() => Book.delete({}, { id: 'BOOK_ID' }), 'ResourceNotFoundException')
    })
  })

  describe('Dynamo._update(id, attributes)', () => {
    it('updates document', async() => {
      const attributes = {
        firstName: 'Alexander updated'
      }

      const { objects } = await Profile.index({}, { firstName: 'Alexander' })
      const { id } = objects[0]

      await Profile.update({}, { id }, attributes)
      const updatedProfile = await Profile.read({}, { id })

      expect(updatedProfile.attributes).to.include(attributes)
    })

    it('APPENDS attrubute to array ', async() => {
      await Profile.create({}, {
        firstName: 'Max',
        tags: ['great']
      })

      const attributes = {
        'tags:append': 'good'
      }

      const { objects } = await Profile.index({}, { firstName: 'Max' })
      const { id } = objects[0]

      await Profile.update({}, { id }, attributes)
      const updatedProfile = await Profile.read({}, { id })

      expect(updatedProfile.attributes).to.have.property('tags')
      expect(updatedProfile.attributes.tags).to.include('good')
    })

    it('throws an document is not found error if conditional check fails for unique array attribute', async() => {
      await Profile.create({}, {
        firstName: 'Max',
        tags: ['great']
      })

      const attributes = {
        'tags:append': 'great'
      }

      const { objects } = await Profile.index({}, { firstName: 'Max' })
      const { id } = objects[0]

      await expectError(() => Profile.update({}, { id }, attributes), 'DocumentNotFound')
    })

    it('throws an error if document is not found', async() => {
      await expectError(() => Profile.update({}, { id: 'BOOK_ID' }, {}), 'DocumentNotFound')
    })

    it('throws an error if table does not exist', async() => {
      await expectError(() => Book.read({}, { id: 'BOOK_ID' }), 'ResourceNotFoundException')
    })
  })
})
