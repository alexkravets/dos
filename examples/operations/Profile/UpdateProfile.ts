import Profile from '../../documents/Profile';
import {
  Update,
  JwtAuthorization,
  SystemAuthorization,
  TEST_PUBLIC_KEY as publicKey
} from '../../../src';

/** Update profile operation. */
class UpdateProfile extends Update(Profile) {
  /** Overrides default operation tags with custom ones. */
  static get tags() {
    return [ 'Profiles', 'profiles-write' ];
  }

  /** Returns operation security requirements. */
  static get security() {
    return [
      SystemAuthorization.createRequirement(),
      JwtAuthorization.createRequirement({ publicKey })
    ];
  }
}

export default UpdateProfile;
