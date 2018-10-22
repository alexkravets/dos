'use strict'

const uuid    = require('uuid/v1')
const chalk   = require('chalk')
const pick    = require('lodash.pick')
const connect = require('./connect')
const DocumentNotFound = require('../../errors/DocumentNotFound')

const { client, rawClient, tablePrefix } = connect()

const Dynamo = AbstractDocument => class extends AbstractDocument {
  static _filterHiddenAttributes(item) {
    return pick(item, Object.keys(item).filter(key => !key.startsWith('_')))
  }

  static _buildFilterExpression(filter) {
    const attributes = {}
    const values     = {}
    const expression = []

    for (const key in filter) {
      attributes[`#${key}`] = key
      values[`:${key}`] = filter[key] || null
      expression.push(`#${key} = :${key}`)
    }

    return {
      attributes,
      values,
      expression: expression.join(' and '),
    }
  }

  static async _create(Item) {
    Item.id = uuid()

    const parameters = {
      TableName: this.tableName,
      Item: {
        ...Item,
        _isDeleted: 0
      }
    }

    try {
      await client.put(parameters).promise()

    } catch (error) {
      if (error.name == 'ResourceNotFoundException') {
        console.error(chalk`{dim Collection {reset ${this.tableName}} does not exists}`)
      }

      throw error
    }
  }

  static async _index(query, options) {
    const { limit, exclusiveStartKey, sort } = options || {}

    let parameters = {
      TableName:                 this.tableName,
      IndexName:                 'listIndex',
      ScanIndexForward:          sort === 'asc',
      KeyConditionExpression:    '#_isDeleted = :_isDeleted',
      ExpressionAttributeNames:  { '#_isDeleted': '_isDeleted' },
      ExpressionAttributeValues: { ':_isDeleted': 0 }
    }

    if (limit) {
      parameters.Limit = limit
    }

    if (exclusiveStartKey) {
      const buffer = Buffer.from(exclusiveStartKey, 'hex')
      const keyString = buffer.toString('utf-8')
      const [id, createdAt] = keyString.split('|')
      parameters.ExclusiveStartKey = {
        id,
        createdAt,
        _isDeleted: 0
      }
    }

    // Build filter condition here
    if (Object.keys(query).length) {
      const {
        expression,
        attributes,
        values
      } = this._buildFilterExpression(query)

      parameters.FilterExpression = expression
      parameters.ExpressionAttributeNames = {
        ...parameters.ExpressionAttributeNames,
        ...attributes
      }
      parameters.ExpressionAttributeValues = {
        ...parameters.ExpressionAttributeValues,
        ...values
      }
    }

    let items = []
    let lastEvaluatedKey

    try {
      // Scan items until get all items or limit
      do {
        const {
          Items,
          LastEvaluatedKey
        } = await client.query(parameters).promise()
        if (items.length + Items.length > limit) {
          // If last chunk has more elements than needed
          const last = items.length + Items.length - limit
          const { id, createdAt } = LastEvaluatedKey

          lastEvaluatedKey = { id, createdAt}
          items = [...items, ...Items.slice(0, -last)]
        } else {
          lastEvaluatedKey = LastEvaluatedKey
          items = [...items, ...Items]
        }


        if (items.length < limit && lastEvaluatedKey) {
          parameters.ExclusiveStartKey = lastEvaluatedKey
        }
      } while (items.length < limit && lastEvaluatedKey)

    } catch (error) {
      if (error.name == 'ResourceNotFoundException') {
        console.error(chalk`{dim Collection {reset ${this.tableName}} does not exists}`)
      }

      throw error
    }

    if (lastEvaluatedKey) {
      const { id, createdAt } = lastEvaluatedKey
      const buffer = Buffer.from(`${id}|${createdAt}`, 'utf-8')

      lastEvaluatedKey = buffer.toString('hex')
    }

    return {
      docs:  items.map(item => this._filterHiddenAttributes(item)),
      count: items.length,
      lastEvaluatedKey
    }
  }

  static async _read(id) {
    const parameters = {
      TableName: this.tableName,
      Key:       { id }
    }

    let result
    try {
      result = await client.get(parameters).promise()

    } catch (error) {
      if (error.name == 'ResourceNotFoundException') {
        console.error(chalk`{dim Collection {reset ${this.tableName}} does not exists}`)
      }

      throw error
    }

    const { Item } = result

    if (!Item || Item._isDeleted) {
      throw new DocumentNotFound(this.name)
    }

    return this._filterHiddenAttributes(Item)
  }

  static async _update(id, attributes) {
    const UpdateExpressions         = []
    const ExpressionAttributeNames  = {}
    const ExpressionAttributeValues = { ':id': id }
    const ConditionExpression       = 'id = :id'

    for (const name in attributes) {
      ExpressionAttributeNames[`#${name}`]  = name
      ExpressionAttributeValues[`:${name}`] = attributes[name]
      UpdateExpressions.push(`#${name} = :${name}`)
    }

    const UpdateExpression = `SET ${UpdateExpressions.join(', ')}`

    const parameters = {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ConditionExpression,
      UpdateExpression,
      TableName:    this.tableName,
      ReturnValues: 'ALL_NEW',
      Key:          { id }
    }

    let result

    try {
      result = await client.update(parameters).promise()

    } catch (originalError) {
      if (originalError.name == 'ConditionalCheckFailedException') {
        throw new DocumentNotFound(this.name, originalError)
      }

      if (originalError.name == 'ResourceNotFoundException') {
        console.error(chalk`{dim Collection {reset ${this.tableName}} does not exists}`)
      }

      throw originalError
    }

    return result.Attributes
  }

  static async _delete(id) {
    await this._update(id, {
      _isDeleted: 1
    })
  }

  static get tableName() {
    return `${tablePrefix}-${this.name}s`
  }

  static get tableSchema() {
    const TableName = this.tableName

    const AttributeDefinitions = [{
      AttributeName: 'id',
      AttributeType: 'S'
    }, {
      AttributeName: 'createdAt',
      AttributeType: 'S'
    }, {
      AttributeName: '_isDeleted',
      AttributeType: 'N'
    }]

    const KeySchema = [{
      AttributeName: 'id',
      KeyType:       'HASH'
    }]

    const GlobalSecondaryIndexes = [{
      IndexName: 'listIndex',
      KeySchema: [{
        AttributeName: '_isDeleted',
        KeyType: 'HASH',
      }, {
        AttributeName: 'createdAt',
        KeyType: 'RANGE',
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits:  1,
        WriteCapacityUnits: 1
      },
      Projection: {
        ProjectionType: 'ALL',
      },
    }]

    return {
      TableName,
      AttributeDefinitions,
      KeySchema,
      GlobalSecondaryIndexes,
      ProvisionedThroughput: {
        ReadCapacityUnits:  1,
        WriteCapacityUnits: 1
      }
    }
  }

  static async createCollection() {
    try {
      await rawClient.createTable(this.tableSchema).promise()

    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.info(chalk`{dim Collection {reset ${this.tableName}} already exists}`)
        return
      }

      throw error
    }

    console.info(chalk`{dim Collection {reset ${this.tableName}} created}`)
  }

  static async deleteCollection() {
    const parameters = {
      TableName: this.tableName
    }

    await rawClient.deleteTable(parameters).promise()
    console.info(chalk`{dim Collection {reset ${this.tableName}} deleted}`)
  }
}

module.exports = Dynamo
