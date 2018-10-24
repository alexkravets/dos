'use strict'

const Dynamo       = require('lib/aws/dynamo')
const { Document } = require('test/app/lib')

class Book extends Dynamo(Document) {
}

module.exports = Book
