import Profile from '../documents/Profile';

import Health from './Service/Health';
import ReadProfile from './Profile/ReadProfile'  ;
import CreateProfile from './Profile/CreateProfile';
import UpdateProfile from './Profile/UpdateProfile';
import DeleteProfile from './Profile/DeleteProfile';
import IndexProfiles from './Profile/IndexProfiles';

const modules = [
  Profile,
  Health,
  ReadProfile,
  CreateProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles,
];

export default modules;
