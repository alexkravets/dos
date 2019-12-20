'use strict'

const execute = app => {
  const { _composer: composer } = app

  return (operationId, input = {}, headers = {}) => {
    const Operation = app.operationsMap[operationId]
    const req = { query: input, headers }

    if (req.query.mutation) {
      req.mutation = req.query.mutation
      delete req.query.mutation
    }

    const handler = new Operation({ req, composer })
    return handler.exec()
  }
}

module.exports = execute
