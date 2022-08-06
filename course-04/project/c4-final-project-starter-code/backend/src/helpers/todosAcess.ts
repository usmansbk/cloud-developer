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
        Limit: limit,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
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

    await dbClient
      .put({
        TableName: todosTable,
        Item: item
      })
      .promise()

    return item
  }

  static async update(todoId: string, userId: string, values: TodoUpdate) {
    logger.info({
      action: 'Update',
      todoId,
      values
    })

    await dbClient
      .update({
        TableName: todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression:
          'set #name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ExpressionAttributeValues: {
          ':name': values.name,
          ':dueDate': values.dueDate,
          ':done': values.done
        }
      })
      .promise()
  }

  static async delete(todoId: string, userId: string) {
    logger.info({
      action: 'Delete',
      todoId
    })

    await dbClient
      .delete({
        TableName: todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }

  static async exists(todoId: string, userId: string): Promise<boolean> {
    const result = await dbClient
      .get({
        TableName: todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return !!result.Item
  }

  static async updateAttachment(
    todoId: string,
    userId: string,
    url: string
  ): Promise<TodoItem> {
    logger.info({
      action: 'Update',
      todoId,
      userId,
      url
    })

    const { Attributes: todo } = await dbClient
      .update({
        TableName: todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: { ':attachmentUrl': url }
      })
      .promise()

    return todo as TodoItem
  }
}
