'use strict'

const { Document } = require('test/app/lib')
const Dynamo       = require('lib/aws/dynamo')

class Wrong extends Dynamo(Document) {
}

module.exports = Wrong
