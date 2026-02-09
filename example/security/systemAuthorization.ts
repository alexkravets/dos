import { SystemAuthorization, type Operation } from '../../src';

const authorizationRequirement = SystemAuthorization.createRequirement();

/** Extends operation class with system authorization requirements. */
const systemAuthorization = (OperationClass: typeof Operation) =>
  /** Extended operation class. */
  class extends OperationClass {
    /** Returns operation security requirements. */
    static get security() {
      return [ authorizationRequirement ];
    }
  };

export default systemAuthorization;
