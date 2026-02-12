import { as } from '../../security';
import { Delete } from '../../lib';
import { Profile } from '../../documents';

/** Delete profile operation. */
class DeleteProfile extends as.User(Delete(Profile)) {
};

export default DeleteProfile;
