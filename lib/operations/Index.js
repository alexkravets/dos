'use strict'

const { Index: IndexOperation } = require('@slatestudio/adept')
const omit    = require('lodash.omit')
const Handler = require('../Handler')

class Index extends Handler(IndexOperation) {
  // TODO: Disable perPage and page parameters while it's not supported by
  //       dynamodb.
  static get query() {
    return {}
  }

  async initialize() {
    await super.initialize()

    this.page    = this.query.page    || 1
    this.perPage = this.query.perPage || this.constructor.defaultPerPage

    this.query = omit(this.query, [ 'page', 'perPage' ])
  }

  async action() {
    const options = { page: this.page, perPage: this.perPage }
    const { objects, count } = await this.Model.index(this.query, options)
    this.result = objects
    this.setPaginationHeaders(count)
  }

  setPaginationHeaders(totalCount) {
    const pagesCount = Math.ceil(totalCount / this.perPage)

    this.headers['x-page']        = this.page
    // this.headers['x-per-page']    = this.perPage
    this.headers['x-per-page']    = totalCount
    this.headers['x-pages-count'] = pagesCount
    this.headers['x-total-count'] = totalCount

    if (pagesCount > this.page) {
      this.headers['x-next-page'] = this.page + 1
    }
  }
}

module.exports = Index
