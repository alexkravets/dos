'use strict'

const authorize = async (Operation, context) => {
  // headers = {}, requirements = []

  const isPublic = requirements.length === 0

  if (isPublic) { return {} }

  let authorizationContext = {}
  let authorizationErrorsCount
  let authorizationError

  for (const orRequirement of requirements) {
    authorizationErrorsCount = 0

    for (const andRequirementKey in orRequirement) {
      const andRequirement = orRequirement[andRequirementKey]
      const SecurityClass  = andRequirement.klass

      const security    = new SecurityClass(context)
      const { options } = andRequirement

      const { isAuthorized, error, ...rest } = await security.isAuthorized(options)

      if (isAuthorized) {
        authorizationContext = { ...authorizationContext, ...rest }

      } else {
        authorizationError = error
        authorizationErrorsCount += 1

      }
    }

    const isRequestAuthorized = authorizationErrorsCount === 0

    if (isRequestAuthorized) {
      return authorizationContext
    }
  }

  throw authorizationError
}

module.exports = authorize
