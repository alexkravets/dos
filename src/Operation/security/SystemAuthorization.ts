import Operation from '../Operation';
import LambdaAuthorization from './LambdaAuthorization';

const authorizationRequirement = LambdaAuthorization.createRequirement();

/** Returns helper to extend operation class with system authorization requirements. */
const systemAuthorization = () => {
  return (OperationClass: typeof Operation): typeof Operation =>
    /** Extended operation class. */
    class extends OperationClass {
      /** Returns operation security requirements. */
      static get security() {
        return [ authorizationRequirement ];
      }
    };
};

export default systemAuthorization;
