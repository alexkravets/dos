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

// eslint-disable-next-line jsdoc/require-jsdoc
const verifySystemAccess = (context: Context) => {
  const { headers } = context;

  const isExternalRequest = Object.keys(headers).length > 0;

  if (!isExternalRequest) {
    return [ true ];
  }

  return [ false, MESSAGE_ACCESS_DENIED ];
};

// eslint-disable-next-line jsdoc/require-jsdoc
class SystemAuthorization {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor({
    accessVerificationMethod = verifySystemAccess,
  }) {
    this._verifyAccess = accessVerificationMethod;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static createRequirement(options = {}) {
    const name = get(options, 'name', 'authorization');

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
        klass: this,
        ...options
      }
    };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get errors() {
    return {
      AccessDeniedError: {
        statusCode:  403,
        description: MESSAGE_ACCESS_DENIED
      }
    };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  async verify(context) {
    const [ isAccessOk, accessErrorMessage ] = await this._verifyAccess(context);

    if (!isAccessOk) {
      const error = new AccessDeniedError(accessErrorMessage);
      return { isAuthorized: false, error };
    }

    return { isAuthorized: true, isSystem: true };
  }
}

export default SystemAuthorization;
