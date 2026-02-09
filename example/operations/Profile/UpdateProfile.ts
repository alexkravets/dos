import { as } from '../../security';
import { Update } from '../../../src';
import { Profile } from '../../documents';

/** Update profile operation. */
class UpdateProfile extends as.User(Update(Profile)) {
};

export default UpdateProfile;
