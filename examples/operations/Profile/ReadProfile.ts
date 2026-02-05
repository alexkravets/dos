import { Read } from '../../../src';
import Profile from '../../documents/Profile';

/** Read profile operation. */
class ReadProfile extends Read(Profile) {
  /** Overrides default query schema source. */
  static get query() {
    return {
      id: {
        description: 'Profile ID',
        required: true,
        example: 'PRO_1'
      }
    };
  }
}

export default ReadProfile;
