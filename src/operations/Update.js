'use strict';

const Operation         = require('../Operation');
const getComponentTitle = require('../helpers/getComponentTitle');

// eslint-disable-next-line jsdoc/require-jsdoc
const Update = (Component, componentAction = 'update') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Update" operation' +
      ' function');
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  return class extends Operation {
    // eslint-disable-next-line jsdoc/require-jsdoc
    static get Component() {
      return Component;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get componentAction() {
      return componentAction;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get type() {
      return Operation.types.UPDATE;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get errors() {
      const documentTitle = getComponentTitle(this.Component);

      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode:  404,
          description: `${documentTitle} is not found`
        }
      };
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get query() {
      const documentTitle = getComponentTitle(this.Component);

      return {
        id: {
          description: `${documentTitle} ID`,
          required: true
        }
      };
    }
  };
};

module.exports = Update;
