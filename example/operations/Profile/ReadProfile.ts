import { as } from '../../security';
import { Read } from '../../lib';
import { Profile } from '../../documents';

/** Read profile operation. */
class ReadProfile extends as.User(Read(Profile)) {
};

export default ReadProfile;
