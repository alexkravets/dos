import Profile from '../../documents/Profile';
import {
  got,
  Create,
  Context,
  JwtAuthorization,
  TEST_PUBLIC_KEY as publicKey,
} from '../../../src';

type Claims = {
  group?: string;
};

/** Ensures user is in administrators group. */
const accessVerificationMethod = async (_context: Context, claims: Claims): Promise<[ true ] | [ false, string ]> => {
  const group = got(claims, 'group');

  const isAccessGranted = [ 'Administrators' ].includes(group);

  if (!isAccessGranted) {
    return [ false, 'Access denied' ];
  }

  return [ true ];
};

/** Create profile operation. */
class CreateProfile extends Create(Profile) {
  /** Overrides default operation tags with custom ones. */
  static get tags() {
    return [ 'Profiles', 'profiles-write' ];
  }

  /** Returns operation security requirements. */
  static get security() {
    return [
      JwtAuthorization.createRequirement({
        publicKey,
        accessVerificationMethod
      })
    ];
  }
}

export default CreateProfile;
