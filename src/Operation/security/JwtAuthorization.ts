import Context from '../../Context';
import verifyToken from './verifyToken';
import AccessDeniedError from '../errors/AccessDeniedError';
import UnauthorizedError from '../errors/UnauthorizedError';
import { get, capitalize } from 'lodash';
import { decode, type Algorithm } from 'jsonwebtoken';
import type { VerificationResult, Requirement } from '../../Service/authorize';

type Claims = {
  sub?: string;
  iss?: string;
  permissions?: string[];
  [x: string]: unknown;
}

type TokenVerificationMethod = (
  context: Context,
  token: string,
  publicKey: string,
  algorithm: Algorithm
) => Promise<[ true ] | [ false, string ]>;

type AccessVerificationMethod = (
  context: Context,
  claims: Claims,
  permissions?: Permissions,
) => Promise<[ true ] | [ false, string ]>;

type NormalizeClaimsMethod = (claims: Claims) => Claims;

type RequirementOptions = {
  name?: string;
  issuer?: string;
  publicKey: string;
  cookieName?: string;
  description?: string;
  permissions?: Permissions;
  requirementName?: string;
  algorithm?: Algorithm;
  normalizeClaimsMethod?: NormalizeClaimsMethod;
  tokenVerificationMethod?: TokenVerificationMethod;
  accessVerificationMethod?: AccessVerificationMethod;
}

export type Permissions = Record<string, string[]>;

const DEFAULT_HEADER_NAME = 'authorization';

const MESSAGE_ACCESS_DENIED = 'Access denied';

/** Default method to normalize claims. */
const DEFAULT_NORMALIZED_CLAIMS_METHOD = (claims: Claims) => claims;

/** Ensures permissions claim includes permissions required by an operation. */
const DEFAULT_ACCESS_VERIFICATION_METHOD = async (
  context: Context,
  claims: Claims,
  permissionsMap?: Permissions
): Promise<[ true ] | [ false, string ]> => {
  if (!permissionsMap) {
    return [ true ];
  }

  const { operationId } = context;

  const permissionsClaim = get(claims, 'permissions', []);

  for (const permission of permissionsClaim) {
    const operationIds = get(permissionsMap, permission, []) as string[];

    const hasAccess = operationIds.includes(operationId);

    if (hasAccess) {
      return [ true ];
    }
  }

  return [ false, MESSAGE_ACCESS_DENIED ];
};

/** JWT Authorization */
class JwtAuthorization {
  private _name: string;
  private _issuer?: string;
  private _publicKey: string;
  private _algorithm: Algorithm;
  private _cookieName: string;
  private _permissions?: Permissions;

  private _verifyToken: TokenVerificationMethod;
  private _verifyAccess: AccessVerificationMethod;
  private _normalizeClaims: NormalizeClaimsMethod;

  /** Creates an instance of JWT authorization security. */
  constructor({
    name,
    issuer,
    publicKey,
    cookieName,
    permissions,
    algorithm = 'RS256',
    normalizeClaimsMethod = DEFAULT_NORMALIZED_CLAIMS_METHOD,
    tokenVerificationMethod = verifyToken,
    accessVerificationMethod = DEFAULT_ACCESS_VERIFICATION_METHOD,
  }: {
    name: string;
    issuer?: string;
    publicKey: string;
    algorithm?: Algorithm;
    cookieName?: string;
    permissions?: Permissions;
    normalizeClaimsMethod?: NormalizeClaimsMethod;
    tokenVerificationMethod?: TokenVerificationMethod;
    accessVerificationMethod?: AccessVerificationMethod;
  }) {
    this._name = name;
    this._issuer = issuer;
    this._publicKey = publicKey;
    this._algorithm = algorithm;
    this._cookieName = cookieName || name;
    this._permissions = permissions;

    this._verifyToken = tokenVerificationMethod;
    this._verifyAccess = accessVerificationMethod;
    this._normalizeClaims = normalizeClaimsMethod;
  }

  /** Returns specification for JWT authorization security requirement. */
  static createRequirement(options: RequirementOptions): Record<string, Requirement> {
    const name = get(options, 'name', DEFAULT_HEADER_NAME);
    const description = get(options, 'description');
    const requirementName = get(options, 'requirementName', capitalize(name));

    return {
      [requirementName]: {
        definition: {
          in: 'header',
          type: 'apiKey',
          name,
          description,
        },
        errors: JwtAuthorization.errors,
        /** Verifies context via JWT authorization requirement. */
        verify: (context: Context) => {
          const security = new JwtAuthorization({ name, ...options });
          return security.verify(context);
        }
      }
    };
  }

  /** Returns security related errors. */
  static get errors() {
    return {
      UnauthorizedError: {
        statusCode:  401,
        description: 'Unauthorized request'
      },
      AccessDeniedError: {
        statusCode:  403,
        description: 'Operation access denied'
      }
    };
  }

  /** Verifies JWT authorization. */
  async verify(context: Context): Promise<VerificationResult> {
    const { headers, cookies } = context;

    let token = get(cookies, this._cookieName);

    if (!token) {
      token = headers[this._name] as string;
    }

    if (!token) {
      const error = new UnauthorizedError(`Header "${this._name}" is missing`);

      return {
        isAuthorized: false,
        error
      };
    }

    token = token.replace(/^bearer\s+/i, '');

    const object = decode(token, { complete: true });

    if (!object) {
      const error = new UnauthorizedError(`Invalid "${this._name}" token`);

      return {
        isAuthorized: false,
        error
      };
    }

    const [ isTokenOk, tokenErrorMessage ] =
      await this._verifyToken(context, token, this._publicKey, this._algorithm);

    if (!isTokenOk) {
      const error = new UnauthorizedError(`"${this._name}" token verification failed: ${tokenErrorMessage}`);

      return {
        isAuthorized: false,
        error
      };
    }

    const claims = object.payload as Claims;

    if (this._issuer) {
      const { iss } = claims;

      const isValidIssuer = iss === this._issuer;

      if (!isValidIssuer) {
        const error = new UnauthorizedError(`Invalid issuer of "${this._name}" token`);

        return {
          isAuthorized: false,
          error
        };
      }
    }

    const [ isAccessOk, accessErrorMessage ] = await this._verifyAccess(context, claims, this._permissions);

    if (!isAccessOk) {
      const error = new AccessDeniedError(accessErrorMessage);

      return {
        isAuthorized: false,
        error
      };
    }

    const normalizedClaims = this._normalizeClaims(claims);

    return {
      isAuthorized: true,
      claims: normalizedClaims
    };
  }
}

export default JwtAuthorization;
