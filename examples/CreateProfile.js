'use strict';

const Create           = require('../src/operations/Create');
const Profile          = require('./Profile');
const verifyToken      = require('../src/security/verifyToken');
const { publicKey }    = require('../src/test/keys');
const JwtAuthorization = require('../src/security/JwtAuthorization');

// eslint-disable-next-line jsdoc/require-jsdoc
class CreateProfile extends Create(Profile) {
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get tags() {
    return [
      'Profiles',
      'profiles-write',
      'System'
    ];
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get security() {
    const algorithm = 'RS256';

    // eslint-disable-next-line jsdoc/require-jsdoc
    const accessVerificationMethod = (context, { group }) => {
      const isAccessGranted = [ 'Administrators' ].includes(group);

      return [ isAccessGranted, 'Access denied' ];
    };

    // eslint-disable-next-line jsdoc/require-jsdoc
    const tokenVerificationMethod = (...args) => verifyToken(...args);

    return [
      JwtAuthorization.createRequirement({
        publicKey,
        algorithm,
        tokenVerificationMethod,
        accessVerificationMethod
      })
    ];
  }
}

module.exports = CreateProfile;
