import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

AWSXRay.captureAWS(AWS)

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
    after: Key | null,
    limit: number
  ): Promise<{ items: TodoItem[]; nextKey: string | null }> {
    logger.info({
      action: 'Query',
      userId,
      limit,
      after
    })
    const { Items: items, LastEvaluatedKey } = await dbClient
      .query({
        TableName: todosTable,
        ExclusiveStartKey: after,
        Limit: limit
      })
      .promise()

    return {
      items: items as TodoItem[],
      nextKey: encodeNextKey(LastEvaluatedKey)
    }
  }

  static async create(item: TodoItem): Promise<TodoItem> {
    logger.info({
      action: 'Create',
      item
    })

    const { Attributes: todo } = await dbClient
      .put({
        TableName: todosTable,
        Item: item
      })
      .promise()

    return todo as TodoItem
  }

  static async update(
    todoId: string,
    attributes: TodoUpdate
  ): Promise<TodoItem> {
    logger.info({
      action: 'Update',
      todoId,
      attributes
    })

    const { Attributes: todo } = await dbClient
      .update({
        TableName: todosTable,
        Key: {
          todoId
        }
      })
      .promise()

    return todo as TodoItem
  }

  static async delete(todoId: string): Promise<TodoItem> {
    logger.info({
      action: 'Delete',
      todoId
    })

    const { Attributes: todo } = await dbClient
      .delete({
        TableName: todosTable,
        Key: {
          todoId
        }
      })
      .promise()

    return todo as TodoItem
  }
}
