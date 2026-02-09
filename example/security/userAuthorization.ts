import { get } from 'lodash';
import {
  type Context,
  type Operation,
  JwtAuthorization,
  TEST_PUBLIC_KEY as publicKey
} from '../../src';

const PERMISSIONS = {
  'profiles-read': [
    'ReadProfile',
    'IndexProfiles',
  ],
  'profiles-write': [
    'CreateProfile',
    'UpdateProfile',
    'DeleteProfile',
  ]
};

const MESSAGE_ACCESS_DENIED = 'Access denied';

type Claims = {
  permissions?: string[];
}

/** Ensures user is in administrators group. */
const accessVerificationMethod = async (
  context: Context,
  claims: Claims
): Promise<[ true ] | [ false, string ]> => {
  const { operationId } = context;

  const permissions = get(claims, 'permissions', []);

  for (const permission of permissions) {
    const operationIds = get(PERMISSIONS, permission, []) as string[];

    const hasAccess = operationIds.includes(operationId);

    if (hasAccess) {
      return [ true ];
    }
  }

  return [ false, MESSAGE_ACCESS_DENIED ];
};

const authorizationRequirement = JwtAuthorization.createRequirement({
  publicKey,
  accessVerificationMethod,
});

/** Extends operation class with user authorization requirement. */
const userAuthorization = (OperationClass: typeof Operation): typeof Operation =>
  /** Extended operation class. */
  class extends OperationClass {
    /** Returns operation security requirements. */
    static get security() {
      return [ authorizationRequirement ];
    }
  };

export default userAuthorization;
