import {
  userAuthorization,
  systemAuthorization,
  TEST_ISSUER as issuer,
  TEST_PUBLIC_KEY as publicKey
} from '../../src';

const permissions = {
  'profiles-read': [
    'ReadProfile',
    'IndexProfiles',
  ],
  'profiles-write': [
    'CreateProfile',
    'UpdateProfile',
    'DeleteProfile',
  ]
};

const as = {
  User: userAuthorization({ issuer, publicKey, permissions }),
  System: systemAuthorization(),
};

export { as };
