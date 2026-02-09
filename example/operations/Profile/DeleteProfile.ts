import { as } from '../../security';
import { Delete } from '../../../src';
import { Profile } from '../../documents';

/** Delete profile operation. */
class DeleteProfile extends as.User(Delete(Profile)) {
};

export default DeleteProfile;
