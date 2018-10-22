'use strict'

class MockService {
  constructor() {
    this._operationsStack = []
  }

  mock(operationId, parameters, result) {
    const mock = { operationId, parameters, result }
    this._operationsStack.push(mock)
  }

  request(operationId) {
    const index     = this._operationsStack.findIndex(operation => operation.operationId == operationId)
    const operation = this._operationsStack[index]

    if (!operation) {
      throw new Error(`Operations mock is not found for \`${operationId}\``)
    }

    this._operationsStack.splice(index, 1)
    return operation.result
  }

  done() {
    const isAllDone = this._operationsStack.length == 0

    if (!isAllDone) {
      throw new Error('Following mocks have not been resolved:', this._operationsStack)
    }
  }
}

module.exports = MockService
