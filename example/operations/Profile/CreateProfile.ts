import { as } from '../../security';
import { Create } from '../../../src';
import { Profile } from '../../documents';

/** Create profile operation. */
class CreateProfile extends as.User(Create(Profile)) {
  /** Overrides default operation tags with custom ones. */
  static get tags() {
    return [ 'Profiles', 'profiles-write' ];
  }
}

export default CreateProfile;
