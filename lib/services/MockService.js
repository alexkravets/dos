'use strict'

class MockService {
  constructor() {
    this._operationsStack = []
  }

  mock(operationId, parameters, result) {
    const mock = { operationId, parameters, result }
    this._operationsStack.push(mock)
  }

  request(operationId, parameters) {
    const index     = this._operationsStack.findIndex(operation => operation.operationId == operationId)
    const operation = this._operationsStack[index]
    if (!operation) {
      throw new Error('Did not found mock for operation:', operationId)
    }

    this._operationsStack.splice(index, 1)
    return operation.result
  }

  done() {
    const isAllDone = this._operationsStack.length == 0
    if (!isAllDone) {
      throw new Error('Next mocks did not executed:', this._operationsStack)
    }
  }

}

module.exports = MockService
