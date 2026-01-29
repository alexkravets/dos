import type { Context } from '../Context';
import UnauthorizedError from '../errors/UnauthorizedError';
import AccessDeniedError from '../errors/AccessDeniedError';

export type ErrorResponse = {
  statusCode: number;
  description: string;
}

type VerificationResultSuccess = {
  isAuthorized: true;
  claims: Record<string, unknown>;
}

type VerificationResultError = {
  isAuthorized: false;
  error: UnauthorizedError | AccessDeniedError;
}

type Requirement = {
  errors: Record<string, ErrorResponse>;
  verify: (context: Context) => Promise<VerificationResultSuccess| VerificationResultError>;
}

export type SecurityRequirements = Record<string, Requirement>[];

/** Verifies operation access via operation security requirements */
const authorize = async (context: Context, requirements: SecurityRequirements) => {
  let authorizationContext = {};

  const isPublic = requirements.length === 0;

  if (isPublic) {
    return authorizationContext;
  }

  let authorizationErrorsCount;
  let authorizationError;

  for (const orRequirement of requirements) {
    authorizationErrorsCount = 0;

    for (const andRequirementKey in orRequirement) {
      const andRequirement = orRequirement[andRequirementKey];
      const { verify } = andRequirement;

      const verificationResult = await verify(context);
      const { isAuthorized } = verificationResult;

      if (isAuthorized) {
        const { claims } = verificationResult;

        authorizationContext = {
          ...authorizationContext,
          ...claims
        };

      } else {
        const { error } = verificationResult;

        authorizationError = error;
        authorizationErrorsCount += 1;

      }
    }

    const isRequestAuthorized = authorizationErrorsCount === 0;

    if (isRequestAuthorized) {
      return authorizationContext;
    }
  }

  throw authorizationError;
};

export default authorize;
