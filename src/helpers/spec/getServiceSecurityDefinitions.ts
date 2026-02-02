import Operation from '../../Operation';
import { OpenAPIV2 } from 'openapi-types';

/** Returns security definitions for service operations. */
const getServiceSecurityDefinitions = (operations: (typeof Operation)[],) => {
  const securityDefinitions = {} as OpenAPIV2.SecurityDefinitionsObject;

  for (const OperationClass of operations) {
    const { security } = OperationClass;
    const hasSecurityRequirements = security.length > 0;

    if (hasSecurityRequirements) {
      for (const requirements of security) {
        for (const name in requirements) {
          const { definition } = requirements[name];

          securityDefinitions![name] = definition;
        }
      }
    }
  }

  return securityDefinitions;
};

export default getServiceSecurityDefinitions;
