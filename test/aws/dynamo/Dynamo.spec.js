'use strict'

const chai           = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { Profile }    = require('test/app/models')
const Wrong          = require('test/app/models/Wrong')

chai.use(chaiAsPromised)

const { expect } = chai

describe('Dynamo :: Document storage driver class', () => {

  before(async() => await Profile.createCollection())
  after(async() => await Profile.deleteCollection())

  describe('Dynamo.createCollection()', () => {
    it('creates collection sucessfully', () => {
      expect(Wrong.createCollection()).to.be.fulfilled
    })

    it('doing nothing with already existing collection', () => {
      expect(Wrong.createCollection()).to.be.fulfilled
    })
  })

  describe('Dynamo.deleteCollection()', () => {
    it('removes collection sucessfully', () => {
      expect(Wrong.deleteCollection()).to.be.fulfilled
    })
  })

  describe('Dynamo._create(Item)', () => {
    it('creates and returns new document', async() => {
      const attributes = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      const document = await Profile.create(null, attributes)

      expect(document.attributes).to.include(attributes)
    })

    it('should throw error for create document in not existing table', () => {
      const attributes = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      expect(Wrong.create(null, attributes)).to.be
        .rejectedWith(Error, 'Cannot do operations on a non-existent table')
    })
  })

  describe('Dynamo._index(query, options)', () => {
    it('gets list of documents', async() => {
      const documents = await Profile.index(null, {}, {})

      expect(documents.count).to.equal(1)
    })

    it('gets list of documents with limit 1', async() => {
      const documents = await Profile.index(null, {}, { limit: 1 })

      expect(documents.count).to.equal(1)
      expect(documents.lastEvaluatedKey).not.to.equal(undefined)
      expect(documents.objects.length).to.equal(1)
    })

    it('gets list of documents with sort ascending', async() => {
      const attributes = {
        firstName: 'Dmitry',
        lastName:  'Panchenko'
      }
      await Profile.create(null, attributes)
      const documents = await Profile.index(null, {}, { sort: 'asc' })

      expect(documents.count).to.equal(2)
      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')
      expect(documents.objects[1].attributes.firstName).to.equal('Dmitry')
    })

    it('gets list of documents with sort descending', async() => {
      const documents = await Profile.index(null, {}, { sort: 'desc' })

      expect(documents.objects[0].attributes.firstName).to.equal('Dmitry')
      expect(documents.objects[1].attributes.firstName).to.equal('Alexander')
    })

    it('gets list of documents with sort descending by default', async() => {
      const documents = await Profile.index(null, {}, {})

      expect(documents.objects[0].attributes.firstName).to.equal('Dmitry')
      expect(documents.objects[1].attributes.firstName).to.equal('Alexander')
    })

    it('gets list of documents from second page', async() => {
      const documentsList = await Profile.index(null, {}, { limit: 1 })
      const { lastEvaluatedKey } = documentsList
      const documents = await Profile.index(null, {}, { exclusiveStartKey: lastEvaluatedKey })

      expect(documents.count).to.equal(1)
      expect(documents.lastEvaluatedKey).to.equal(undefined)
      expect(documents.objects.length).to.equal(1)
    })

    it('gets list of documents with query param with empty result on second page', async() => {
      const documents = await Profile.index(null, { firstName: 'Alexander' }, { limit: 1 })
      const { lastEvaluatedKey } = documents
      const secondPage = await Profile.index(null, { firstName: 'Alexander' }, {
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
      await Profile.create(null, {
        firstName: 'Alexander',
        lastName:  'Petrov'
      })
      await Profile.create(null, {
        firstName: 'Alexander',
        lastName:  'Ivanot'
      })
      await Profile.create(null, {
        firstName: 'Dmitry',
        lastName:  'Sidorov'
      })
      const documents = await Profile.index(null, { firstName: 'Alexander' }, { limit: 2 })

      expect(documents.count).to.equal(2)
      expect(documents.lastEvaluatedKey).not.to.equal(undefined)
      expect(documents.objects.length).to.equal(2)
      expect(documents.objects[0].attributes.firstName).to.equal('Alexander')
    })

    it('gets list of documents with sort descending', async() => {
      const documents = await Profile.index(null, {}, { sort: 'desc' })

      expect(documents.objects[0].attributes.firstName).to.equal('Dmitry')
      expect(documents.objects[1].attributes.firstName).to.equal('Alexander')
    })

    it('throw error for list documents if table does not exist', () => {
      expect(Wrong.index(null, {}, {})).to.be
        .rejectedWith(Error, 'Cannot do operations on a non-existent table')
    })
  })

  describe('Dynamo._read(id)', () => {
    it('gets document by id', async() => {
      const documents = await Profile.index(null, { firstName: 'Alexander' })
      const doc = await Profile.read(null, { id: documents.objects[0].attributes.id })

      expect(doc.attributes.firstName).to.equal('Alexander')
    })

    it('throw error if requested by ID document does not exist', () => {
      expect(Profile.read(null, { id: 'wrong-id' })).to.be
        .rejectedWith(Error, 'Profile document is not found')
    })

    it('throw error for read document in not existing table', () => {
      expect(Wrong.read(null, { id: 'wrong-key-for-wrong-table' })).to.be
        .rejectedWith(Error, 'Cannot do operations on a non-existent table')
    })
  })

  describe('Dynamo._delete(id)', () => {
    it('removes document from table (set isDeleted) and try to read it again', async() => {
      const documents = await Profile.index(null, { firstName: 'Dmitry' })
      const id = documents.objects[0].attributes.id
      await Profile.delete(null, { id })
      expect(Profile.read(null, { id })).to.be
        .rejectedWith(Error, 'Profile document is not found')
    })

    it('throw error for delete document in not existing table', () => {
      expect(Wrong.delete(null, { id: 'wrong-key-for-wrong-table' })).to.be
        .rejectedWith(Error, 'Cannot do operations on a non-existent table')
    })
  })

  describe('Dynamo._update(id, attributes)', () => {
    it('updates document', async() => {
      const attributes = {
        firstName: 'Alexander updated'
      }
      const documents = await Profile.index(null, { firstName: 'Alexander' })
      const id = documents.objects[0].attributes.id
      const doc = await Profile.update(null, { id }, attributes)

      expect(doc.attributes.firstName).to.equal(attributes.firstName)
    })

    it('throw error for update not existing document', async() => {
      expect(Profile.update(null, { id: 'wrong-id' }, {})).rejectedWith(Error, 'Profile document is not found')
    })

    it('throw error for update document in not existing table', () => {
      expect(Wrong.read(null, { id: 'wrong-key-for-wrong-table' })).to.be
        .rejectedWith(Error, 'Cannot do operations on a non-existent table')
    })
  })

})
