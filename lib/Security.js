'use strict'

class Security {
  static get in() {
    return 'header'
  }

  static get type() {
    return 'apiKey'
  }

  static get definition() {
    if (!this._definition) {
      const { type, in: IN, name } = this

      this._definition = {}
      this._definition[name] = { type, in: IN, name }
    }

    return this._definition
  }

  // NOTE: Operation assumed to have `static get security()` method that returns
  //       security requirements, e.g:
  //
  //       static get security() {
  //         return [                            // array of OR requirements
  //           {                                 // hash of AND requirements
  //             Authorization: {
  //               klass:   Authorization,       // security implementation class
  //               options: [ 'Administrators' ] // configuration options
  //             }
  //           }
  //         ]
  //       }
  static async authorize({ req }, requirements) {
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

        const security    = new SecurityClass(req)
        const { options } = andRequirement

        const { isAuthorized, error, context } = await security.isAuthorized(options)

        if (isAuthorized) {
          authorizationContext = { ...authorizationContext, ...context }

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

  constructor(req) {
    this._req = req
  }

  // NOTE: This method to be overriden by the security implementation, this
  //       implementation always authorizes request.
  async isAuthorized() {
    const error   = undefined
    const context = {}

    return { isAuthorized: true, context, error }
  }
}

module.exports = Security
