import { get } from 'lodash';
import { Context } from '../Context';
import AccessDeniedError from '../errors/AccessDeniedError';

const SYSTEM_NAME = 'System';
const DESCRIPTION = 'This security definition and a header for system' +
  ' operations should be ignored. The verification method of system' +
  ' operations relies on a gateway that adds headers for all' +
  ' external requests. Request without headers considered to be' +
  ' internal.';

const MESSAGE_ACCESS_DENIED = 'Access denied, operation is available only for internal requests';

const DEFAULT_HEADER_NAME = 'authorization';

type AccessVerificationMethod = (context: Context) => Promise<[ true ] | [ false, string ]>;

type RequirementOptions = {
  name?: string;
  description?: string;
  requirementName?: string;
  accessVerificationMethod?: AccessVerificationMethod;
}

/** Ensures no headers are set by the gateway. */
const verifyAccess = async (context: Context): Promise<[ true ] | [ false, string ]> => {
  const { headers } = context;

  const isExternalRequest = Object.keys(headers).length > 0;

  if (isExternalRequest) {
    return [ false, MESSAGE_ACCESS_DENIED ];
  }

  return [ true ];
};

/** System Authorization */
class SystemAuthorization {
  private _verifyAccess: AccessVerificationMethod;

  /** Creates an instance of System authorization security. */
  constructor({
    accessVerificationMethod = verifyAccess,
  }: {
    accessVerificationMethod?: AccessVerificationMethod;
  }) {
    this._verifyAccess = accessVerificationMethod;
  }

  /** Creates an instance of system authorization security. */
  static createRequirement(options: RequirementOptions = {}) {
    const name = get(options, 'name', DEFAULT_HEADER_NAME);
    const description = get(options, 'description', DESCRIPTION);
    const requirementName = get(options, 'requirementName', SYSTEM_NAME);

    return {
      [requirementName]: {
        definition: {
          in: 'header',
          type: 'apiKey',
          name,
          description,
        },
        errors: SystemAuthorization.errors,
        /** Verifies context via JWT authorization requirement. */
        verify: (context: Context) => {
          const security = new SystemAuthorization({ ...options });
          return security.verify(context);
        }
      }
    };
  }

  /** Returns security related errors. */
  static get errors() {
    return {
      AccessDeniedError: {
        statusCode:  403,
        description: MESSAGE_ACCESS_DENIED
      }
    };
  }

  /** Verifies System authorization. */
  async verify(context: Context) {
    const [ isAccessOk, accessErrorMessage ] = await this._verifyAccess(context);

    if (!isAccessOk) {
      const error = new AccessDeniedError(accessErrorMessage);
      return { isAuthorized: false, error };
    }

    const claims = {
      isSystem: true,
    };

    return { isAuthorized: true, claims };
  }
}

export default SystemAuthorization;
