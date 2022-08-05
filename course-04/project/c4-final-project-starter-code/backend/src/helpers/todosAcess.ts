import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const dbClient = new DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

function encodeNextKey(key: Key) {
  if (key) {
    return encodeURIComponent(JSON.stringify(key))
  }
  return null
}

export class TodosAccess {
  static async getManyByUserId(
    userId: string,
    startKey: Key | null,
    limit: number
  ): Promise<{ items: TodoItem[]; nextKey: string | null }> {
    logger.info({
      action: 'GET_ALL',
      userId
    })
    const { Items: items, LastEvaluatedKey } = await dbClient
      .query({
        TableName: todosTable,
        ExclusiveStartKey: startKey,
        Limit: limit
      })
      .promise()

    return {
      items: items as TodoItem[],
      nextKey: encodeNextKey(LastEvaluatedKey)
    }
  }

  static async create(item: TodoItem): Promise<TodoItem> {
    const { Attributes: todo } = await dbClient
      .put({
        TableName: todosTable,
        Item: item
      })
      .promise()

    logger.info({
      action: 'CREATE',
      todo
    })

    return todo as TodoItem
  }

  static async update(id: string, attributes: TodoUpdate): Promise<TodoItem> {
    const { Attributes: todo } = await dbClient
      .update({
        TableName: todosTable,
        Key: id as unknown as Key
      })
      .promise()

    logger.info({
      action: 'UPDATE',
      todo
    })

    return todo as TodoItem
  }

  static async delete(id: string): Promise<TodoItem> {
    const { Attributes: todo } = await dbClient
      .delete({
        TableName: todosTable,
        Key: id as unknown as Key
      })
      .promise()

    logger.info({
      action: 'DELETE',
      todo
    })

    return todo as TodoItem
  }
}
