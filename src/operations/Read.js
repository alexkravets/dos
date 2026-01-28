'use strict';

const Operation         = require('../Operation');
const getComponentTitle = require('../helpers/getComponentTitle');

// eslint-disable-next-line jsdoc/require-jsdoc
const Read = (Component, componentAction = 'read') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Read" operation' +
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
    static get errors() {
      const componentTitle = getComponentTitle(this.Component);

      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode:  404,
          description: `${componentTitle} is not found`
        }
      };
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get query() {
      const componentTitle = getComponentTitle(this.Component);

      return {
        id: {
          description: `${componentTitle} ID`,
          required: true
        }
      };
    }
  };
};

module.exports = Read;
