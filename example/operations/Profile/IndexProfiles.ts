import { as } from '../../security';
import { Index } from '../../lib';
import { Profile } from '../../documents';

/** Index profiles operation. */
class IndexProfiles extends as.User(Index(Profile)) {
};

export default IndexProfiles;
