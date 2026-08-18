import Operation from '../Operation';
import LambdaAuthorization from './LambdaAuthorization';

const authorizationRequirement = LambdaAuthorization.createRequirement();

/** Returns helper to extend operation class with system authorization requirements. */
const systemAuthorization = () => {
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
        return [ 'System' ];
      }
    } as unknown as OperationType;
  };
};

export default systemAuthorization;
