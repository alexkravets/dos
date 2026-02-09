import { as } from '../../security';
import { Read } from '../../../src';
import { Profile } from '../../documents';

/** Read profile system operation. */
class ReadProfileSystem extends as.System(Read(Profile)) {
};

export default ReadProfileSystem;
