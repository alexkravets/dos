import { Profile } from '../documents';

import Health from './Service/Health';
import ReadProfile from './Profile/ReadProfile'  ;
import CreateProfile from './Profile/CreateProfile';
import UpdateProfile from './Profile/UpdateProfile';
import DeleteProfile from './Profile/DeleteProfile';
import IndexProfiles from './Profile/IndexProfiles';
import ReadProfileSystem from './Profile/ReadProfileSystem';

const modules = [
  Profile,
  Health,
  ReadProfile,
  CreateProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles,
  ReadProfileSystem,
];

export default modules;
