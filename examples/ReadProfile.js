'use strict';

const Read    = require('../src/operations/Read');
const Profile = require('./Profile');

// eslint-disable-next-line jsdoc/require-jsdoc
class ReadProfile extends Read(Profile) {
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get query() {
    return {
      id: {
        description: 'Profile ID',
        required: true,
        example: 'PRO_1'
      }
    };
  }
}

module.exports = ReadProfile;
