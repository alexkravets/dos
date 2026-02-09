import { as } from '../../security';
import { Read } from '../../../src';
import { Profile } from '../../documents';

/** Read profile operation. */
class ReadProfile extends as.User(Read(Profile)) {
};

export default ReadProfile;
