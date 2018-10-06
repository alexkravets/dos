'use strict'

const uuid    = require('uuid/v1')
const connect = require('./connect')
const DocumentNotFoundError = require('../../errors/DocumentNotFoundError')

const { client, rawClient, tablePrefix } = connect()
const log = console

const Dynamo = AbstractDocument => class extends AbstractDocument {
  static get uniqueAttributes() {
    return []
  }

  static async verifyUniqueness(attributes, name) {
    const value = attributes[name]

    try {
      const query = {}
      query[name] = value

      await this.read(query)

    } catch (error) {
      if (error.code == 'DOCUMENT_NOT_FOUND') {
        return
      }

      throw error
    }

    const error = new Error(`${this.name} with specified ${name} does already exist`)
    error.status = 'Unprocessable Entity'
    error.code   = `NOT_UNIQUE_${this.name}_${name}`.toUpperCase()

    throw error
  }

  static async verifyAttributes(attributes) {
    for (const name of this.uniqueAttributes) {
      await this.verifyUniqueness(attributes, name)
    }
  }

  static async _create(Item) {
    Item.id = uuid()

    await this.verifyAttributes(Item)

    const parameters = {
      TableName: this.tableName,
      Item
    }

    try {
      await client.put(parameters).promise()

    } catch (error) {
      if (error.name == 'ResourceNotFoundException') {
        log.debug(`\x1b[31mCollection ${this.tableName} does not exists\x1b[0m`)
      }

      throw error
    }
  }

  static async _index() {
    const parameters = {
      TableName: this.tableName
    }

    let result
    try {
      result = await client.scan(parameters).promise()

    } catch (error) {
      if (error.name == 'ResourceNotFoundException') {
        log.debug(`\x1b[31mCollection ${this.tableName} does not exists\x1b[0m`)
      }

      throw error
    }

    const { Items: items, Count: count } = result
    return { items, count }
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
        log.debug(`\x1b[31mCollection ${this.tableName} does not exists\x1b[0m`)
      }

      throw error
    }

    const { Item } = result

    if (!Item) {
      throw new DocumentNotFoundError(this.name)
    }

    return Item
  }

  static async _update(id, attributes) {
    const UpdateExpressions         = []
    const ExpressionAttributeNames  = {}
    const ExpressionAttributeValues = { ':id': id }
    const ConditionExpression       = 'id = :id'

    for (const name in attributes) {
      ExpressionAttributeNames[`#${name}`]  = name
      ExpressionAttributeValues[`:${name}`] = attributes[name] || null
      UpdateExpressions.push(`#${name} = :${name}`)
    }

    const UpdateExpression = 'SET ' + UpdateExpressions.join(', ')

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
        throw new DocumentNotFoundError(this.name, originalError)
      }

      if (originalError.name == 'ResourceNotFoundException') {
        log.debug(`\x1b[31mCollection ${this.tableName} does not exists\x1b[0m`)
      }

      throw originalError
    }

    return result.Attributes
  }

  static async _delete(id) {
    const ExpressionAttributeValues = { ':id': id }
    const ConditionExpression       = 'id = :id'

    const parameters = {
      TableName: this.tableName,
      Key:       { id },
      ExpressionAttributeValues,
      ConditionExpression
    }

    try {
      await client.delete(parameters).promise()

    } catch (originalError) {
      if (originalError.name == 'ConditionalCheckFailedException') {
        throw new DocumentNotFoundError(this.name, originalError)
      }

      if (originalError.name == 'ResourceNotFoundException') {
        log.debug(`\x1b[31mCollection ${this.tableName} does not exists\x1b[0m`)
      }

      throw originalError
    }
  }

  static get tableName() {
    return `${tablePrefix}-${this.name}s`
  }

  static get tableSchema() {
    const TableName = this.tableName

    const AttributeDefinitions = [{
      AttributeName: 'id',
      AttributeType: 'S'
    }]

    const KeySchema = [{
      AttributeName: 'id',
      KeyType:       'HASH'
    }]

    return {
      TableName,
      AttributeDefinitions,
      KeySchema,
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
        log.info(`\x1b[2mCollection ${this.tableName} already exists\x1b[0m`)
        return
      }

      throw error
    }

    log.info(`Collection ${this.tableName} created`)
  }

  static async deleteCollection() {
    const parameters = {
      TableName: this.tableName
    }

    await rawClient.deleteTable(parameters).promise()
    log.info(`Collection ${this.tableName} deleted`)
  }
}

module.exports = Dynamo
