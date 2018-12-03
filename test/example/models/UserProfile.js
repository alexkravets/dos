'use strict'

const Document  = require('lib/Document')
const timestamp = new Date().toJSON()

class UserProfile extends Document {
  static get tableName() {
    return 'UserProfile'
  }

  static _index(query, options) { // eslint-disable-line no-unused-vars
    const timestamp = new Date().toJSON()

    const docs = [{
      id:        'USER_PROFILE_ID',
      firstName: 'Alexander',
      lastName:  'Kravets',
      age:       32,
      createdAt: timestamp,
      updatedAt: timestamp
    }]

    return { docs, count: 1 }
  }

  static _create(attributes) {
    attributes.id        = 'USER_PROFILE_ID'
    attributes.createdAt = timestamp
    attributes.updatedAt = timestamp

    return attributes
  }

  static _read(query) {
    if (query.id == 'EXCEPTION') {
      const error = new Error('Unhandled exception')
      error.originalError = { message: 'Simulated error' }

      throw error
    }

    if (query.id == 'INVALID_OUTPUT') {
      return {
        id:        'USER_PROFILE_ID',
        firstName: 'Alexander',
        lastName:  'Kravets'
      }
    }

    return {
      id:        'USER_PROFILE_ID',
      firstName: 'Alexander',
      lastName:  'Kravets',
      createdAt: timestamp,
      updatedAt: timestamp,
      ...query
    }
  }

  static _update(id, attributes) {
    const updatedAt = new Date().toJSON()

    return {
      id,
      updatedAt,
      firstName: 'Alexander',
      lastName:  'Kravets',
      createdAt: timestamp,
      ...attributes
    }
  }

  static _delete(id) { // eslint-disable-line no-unused-vars
    return null
  }
}

module.exports = UserProfile
