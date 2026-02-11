import Operation from '../Operation';
import JwtAuthorization, { type Permissions } from './JwtAuthorization';

type Props = {
  issuer: string;
  publicKey: string;
  permissions?: Permissions;
}

/** Returns helper to extend operation class with user authorization requirement. */
const userAuthorization = (props: Props) => {
  const authorizationRequirement = JwtAuthorization.createRequirement(props);

  return (OperationClass: typeof Operation): typeof Operation =>
    /** Extended operation class. */
    class extends OperationClass {
      /** Returns operation security requirements. */
      static get security() {
        return [ authorizationRequirement ];
      }
    };
};

export default userAuthorization;
