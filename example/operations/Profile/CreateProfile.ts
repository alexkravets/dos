import { as } from '../../security';
import { Create } from '../../../src';
import { Profile } from '../../documents';

/** Create profile operation. */
class CreateProfile extends as.User(Create(Profile)) {
}

export default CreateProfile;
