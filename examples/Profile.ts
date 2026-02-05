import { type Context, MemoryDocument } from '../src';
import { ProfileAttributes } from './ProfileAttributes';

/** Profile document */
class Profile extends MemoryDocument<ProfileAttributes> {
  /** Returns profile name. */
  get name() {
    return this.attributes.name;
  }
}

const context = {} as Context;

// eslint-disable-next-line jsdoc/require-jsdoc
const createProfile = () => {
  const attributes = { id: 'PRO_1' };
  const profile = new Profile(context, attributes);

  const name = profile.name;
  console.log({ name });
};

// eslint-disable-next-line jsdoc/require-jsdoc
const indexProfiles = async () => {
  const { objects: profiles } = await Profile.index(context);
  const [ _profile ] = profiles;

  if (_profile) {
    console.log(_profile.name);
  }
};

// eslint-disable-next-line jsdoc/require-jsdoc
const indexAllProfiles = async () => {
  const { objects: profiles } = await Profile.indexAll(context);
  const [ _profile ] = profiles;

  if (_profile) {
    console.log(_profile.name);
  }
};

// eslint-disable-next-line jsdoc/require-jsdoc
const readProfile = async () => {
  const query = { id: 'PRO_1' };
  const profile = await Profile.read(context, query);

  const name = profile.id;
  console.log({ name });
};

createProfile();
indexProfiles();
indexAllProfiles();
readProfile();

export default Profile;
