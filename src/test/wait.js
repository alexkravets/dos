'use strict';

// eslint-disable-next-line jsdoc/require-jsdoc
const wait = ms => new global.Promise(resolve => setTimeout(resolve, ms));

module.exports = wait;
