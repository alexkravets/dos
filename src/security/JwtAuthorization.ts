import cookie from 'cookie';
import verifyToken from './verifyToken';
import { type Context } from '../Context';
import AccessDeniedError from '../errors/AccessDeniedError';
import UnauthorizedError from '../errors/UnauthorizedError';
import { get, capitalize } from 'lodash';
import { decode, type Algorithm } from 'jsonwebtoken';

type Claims = Record<string, unknown>;

type TokenVerificationMethod = (
  context: Context,
  token: string,
  publicKey: string,
  algorithm: Algorithm
) => Promise<[ true ] | [ false, string ]>;

type AccessVerificationMethod = (
  context: Context,
  claims: Claims
) => Promise<[ true ] | [ false, string ]>;

type NormalizeClaimsMethod = (claims: Claims) => Claims;

type RequirementOptions = {
  name?: string;
  publicKey: string;
  cookieName?: string;
  description?: string;
  requirementName?: string;
  algorithm?: Algorithm;
  normalizeClaimsMethod?: NormalizeClaimsMethod;
  tokenVerificationMethod?: TokenVerificationMethod;
  accessVerificationMethod?: AccessVerificationMethod;
}

const DEFAULT_HEADER_NAME = 'authorization';

/** JWT Authorization */
class JwtAuthorization {
  private _name: string;
  private _publicKey: string;
  private _algorithm: Algorithm;
  private _cookieName: string;

  private _verifyToken: TokenVerificationMethod;
  private _verifyAccess: AccessVerificationMethod;
  private _normalizeClaims: NormalizeClaimsMethod;

  /** Creates an instance of JWT authorization security. */
  constructor({
    name,
    publicKey,
    cookieName,
    algorithm = 'RS256',
    normalizeClaimsMethod = (claims: Claims) => claims,
    tokenVerificationMethod = verifyToken,
    accessVerificationMethod = async () => [ true ],
  }: {
    name: string;
    publicKey: string;
    cookieName: string;
    algorithm?: Algorithm;
    normalizeClaimsMethod?: NormalizeClaimsMethod;
    tokenVerificationMethod?: TokenVerificationMethod;
    accessVerificationMethod?: AccessVerificationMethod;
  }) {
    this._name       = name;
    this._publicKey  = publicKey;
    this._algorithm  = algorithm;
    this._cookieName = cookieName;

    this._verifyToken  = tokenVerificationMethod;
    this._verifyAccess = accessVerificationMethod;
    this._normalizeClaims = normalizeClaimsMethod;
  }

  /** Returns specification for JWT authorization security requirement. */
  static createRequirement(options: RequirementOptions) {
    const name = get(options, 'name', DEFAULT_HEADER_NAME);
    const cookieName = get(options, 'cookieName', name);
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
          const security = new JwtAuthorization({ name, cookieName, ...options });
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
  async verify(context: Context) {
    let token: string | undefined;

    const { headers } = context;

    const hasCookie = 'cookie' in headers;

    if (hasCookie) {
      const cookies = cookie.parse(headers['cookie'] as string);

      token = cookies[this._cookieName] as string;
    }

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
      const error = new UnauthorizedError('Invalid authorization token');

      return {
        isAuthorized: false,
        error
      };
    }

    const [ isTokenOk, tokenErrorMessage ] =
      await this._verifyToken(context, token, this._publicKey, this._algorithm);

    if (!isTokenOk) {
      const error = new UnauthorizedError(tokenErrorMessage);

      return {
        isAuthorized: false,
        error
      };
    }

    const claims = object.payload as Claims;

    const [ isAccessOk, accessErrorMessage ] = await this._verifyAccess(context, claims);

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
      ...normalizedClaims
    };
  }
}

export default JwtAuthorization;
