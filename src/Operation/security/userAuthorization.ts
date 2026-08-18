import Operation from '../Operation';
import JwtAuthorization, { type Permissions } from './JwtAuthorization';

type Props = {
  name?: string;
  issuer: string;
  publicKey: string;
  description?: string;
  permissions?: Permissions;
}

/** Returns helper to extend operation class with user authorization requirement. */
const userAuthorization = (props: Props) => {
  const authorizationRequirement = JwtAuthorization.createRequirement(props);

  return <OperationType>(OperationClass: OperationType): OperationType => {
    const BaseOperation = OperationClass as unknown as typeof Operation;

    /** Extended operation class. */
    return class extends BaseOperation {
      /** Returns operation security requirements. */
      static get security() {
        return [ authorizationRequirement ];
      }

      /** Returns a list of permissions to access operation. */
      static get permissions() {
        const permissionsMap = props.permissions;

        if (!permissionsMap) {
          return null;
        }

        const { id: operationId } = this;

        const operationPermissions = Object.entries(permissionsMap)
          .filter(([, operationIds]) => operationIds.includes(operationId))
          .map(([permission]) => permission);

        const hasPermissionsDefined = operationPermissions.length > 0;

        if (!hasPermissionsDefined) {
          throw new Error(`Permissions not defined for operation "${operationId}"`);
        }

        return operationPermissions;
      }
    } as unknown as OperationType;
  };
};

export default userAuthorization;
