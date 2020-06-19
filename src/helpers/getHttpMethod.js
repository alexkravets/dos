'use strict'

const getHttpMethod = ({ types: TYPES, type }) => {
  switch (type) {
    case TYPES.CREATE:
      return 'post'

    case TYPES.DELETE:
      return 'delete'

    case TYPES.UPDATE:
      return 'patch'

    default:
      return 'get'
  }
}

module.exports = getHttpMethod
