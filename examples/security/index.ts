import userAuthorization from './userAuthorization';
import systemAuthorization from './systemAuthorization';

const as = {
  User: userAuthorization,
  System: systemAuthorization,
};

export { as };
