import { as } from '../../security';
import Profile from '../../documents/Profile';
import { Create } from '../../../src';

/** Create profile operation. */
class CreateProfile extends as.User(Create(Profile)) {
  /** Overrides default operation tags with custom ones. */
  static get tags() {
    return [ 'Profiles', 'profiles-write' ];
  }
}

export default CreateProfile;
