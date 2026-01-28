'use strict';

const Operation       = require('../Operation');
const getComponentTitle = require('../helpers/getComponentTitle');

// eslint-disable-next-line jsdoc/require-jsdoc
const Create = (Component, componentAction = 'create') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Create" operation' +
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
      return Operation.types.CREATE;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get errors() {
      const documentTitle = getComponentTitle(this.Component);

      return {
        ...super.errors,
        DocumentExistsError: {
          statusCode:  422,
          description: `${documentTitle} could not be created, it already exists`
        }
      };
    }
  };
};

module.exports = Create;
