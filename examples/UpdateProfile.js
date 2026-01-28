'use strict';

const Update           = require('../src/operations/Update');
const Profile          = require('./Profile');
const { publicKey }    = require('../src/test/keys');
const JwtAuthorization = require('../src/security/JwtAuthorization');
const SystemAuthorization = require('../src/security/SystemAuthorization');

// eslint-disable-next-line jsdoc/require-jsdoc
class UpdateProfile extends Update(Profile) {
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get tags() {
    return [
      'profiles-write',
      'Profiles',
    ];
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get security() {
    return [
      SystemAuthorization.createRequirement(),
      JwtAuthorization.createRequirement({ publicKey })
    ];
  }
}

module.exports = UpdateProfile;
