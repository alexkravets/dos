'use strict'

const { v4: uuid } = require('uuid')
const ResourceNotFoundError = require('src/errors/ResourceNotFoundError')

const globalMemoryStorage = {}

const Memory = Document => class extends Document {
  static get _storage() {
    return globalMemoryStorage[this.id]
  }

  static _create(attributes) {
    globalMemoryStorage[this.id] = globalMemoryStorage[this.id] || {}

    attributes.id = attributes.id || uuid()

    this._storage[attributes.id] = attributes

    return attributes
  }

  static _read(query) {
    const item = this._storage[query.id]

    if (!item) {
      throw new ResourceNotFoundError(this.id, { query })
    }

    return item
  }

  static _update(query, mutation) {
    const item = this._read(query)

    this._storage[query.id] = { ...item, ...mutation }

    return this._storage[query.id]
  }

  static _delete(query) {
    delete this._storage[query.id]
  }

  static _index() {
    const items = Object.values(this._storage)

    return { items, count: items.length }
  }

  static reset() {
    globalMemoryStorage[this.id] = {}
  }
}

module.exports = Memory
