import { got } from '@kravc/schema';
import { profileSchema } from '../../Context/__tests__/__helpers';
import Context, { type MutationMap } from '../../Context';
import { MemoryDocument, type DefaultAttributes } from '../../';

interface ProfileAttributes extends DefaultAttributes {
  name: string;
};

/** Example of a default document. */
class Profile extends MemoryDocument<ProfileAttributes> {
  /** Returns a profile name. */
  get name() {
    return this.attributes.name;
  }
}

Profile.schema = profileSchema;

/** Example of a document with custom getPartition method. */
class User extends MemoryDocument<ProfileAttributes> {
  /** Returns custom partition based off parameters. */
  static getPartition(_context: Context, parameters: MutationMap) {
    const name = got(parameters, 'name') as string;
    const partition = name[0].toUpperCase();

    return partition;
  }
}

User.schema = profileSchema;

export {
  User,
  Profile,
};

export type {
  ProfileAttributes,
};
