import { Profile } from '../../../Document/__tests__/__helpers';
import userAuthorization from '../userAuthorization';
import { Create, Update } from '../../';
import { TEST_ISSUER as issuer, TEST_PRIVATE_KEY as publicKey } from '../../../Service';

describe('userAuthorization(props)', () => {
  describe('OperationClass.permissions', () => {
    const permissions = {
      'profile-write': [
        'CreateProfile',
      ],
    };

    it('returns null if permissions are not defined', () => {
      const asUser = userAuthorization({ issuer, publicKey });

      /** Operation class to test no permissions case. */
      class CreateProfile extends asUser(Create(Profile)) {}

      expect(CreateProfile.permissions).toBeNull();
    });

    it('returns permissions from the permissions map', () => {
      const asUser = userAuthorization({ issuer, publicKey, permissions });

      /** Operation class to test no permissions case. */
      class CreateProfile extends asUser(Create(Profile)) {}

      expect(CreateProfile.permissions).toEqual([ 'profile-write' ]);
    });

    it('throws exception if operation permissions is not defined', () => {
      const asUser = userAuthorization({ issuer, publicKey, permissions });

      /** Operation class to test no permissions case. */
      class UpdateProfile extends asUser(Update(Profile)) {}

      expect(() => UpdateProfile.permissions)
        .toThrow('Permissions not defined for operation "UpdateProfile"');
    });
  });
});
