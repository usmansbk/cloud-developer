import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { Key } from 'aws-sdk/clients/dynamodb'

const logger = createLogger('businessLogic')

export const getTodosForUser = async (
  userId: string,
  nextKey: Key | null,
  limit: number
): Promise<{ items: TodoItem[]; nextKey: string | null }> => {
  logger.info('getTodosForUser')
  try {
    const result = await TodosAccess.getManyByUserId(userId, nextKey, limit)

    return result
  } catch (e) {
    logger.error((e as Error).message)
    throw e
  }
}

export const createTodo = async (
  input: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  logger.info('createTodo')
  try {
    const todoId = uuid.v4()
    const todo = await TodosAccess.create({
      ...input,
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      done: false
    })

    logger.info('Todo created', {
      userId,
      input
    })
    return todo
  } catch (e) {
    logger.error((e as Error).message)
    throw new createError.BadRequest('Failed to create todo')
  }
}

export const updateTodo = async (
  todoId: string,
  userId: string,
  values: UpdateTodoRequest
) => {
  logger.info('updateTodo')
  try {
    const isValidTodoId = await TodosAccess.exists(todoId)

    if (!isValidTodoId) {
      throw new createError.BadRequest('Invalid Todo ID')
    }

    await TodosAccess.update(todoId, userId, values)

    logger.info('Todo updated', {
      todoId,
      userId,
      values
    })
  } catch (e) {
    logger.error((e as Error).message)
    throw e
  }
}

export const deleteTodo = async (todoId: string, userId: string) => {
  logger.info('deleteTodo')
  try {
    await TodosAccess.delete(todoId, userId)

    logger.info('Todo deleted', {
      todoId,
      userId
    })
  } catch (e) {
    logger.error((e as Error).message)
    throw new createError.BadRequest('Failed to delete todo')
  }
}

export const createAttachmentPresignedUrl = async (
  userId: string,
  todoId: string
): Promise<string> => {
  logger.info('createAttachmentPresignedUrl')

  try {
    const uploadUrl = AttachmentUtils.getUploadUrl(todoId)
    const attachmentUrl = AttachmentUtils.getAttachmentUrl(todoId)
    await TodosAccess.updateAttachment(todoId, userId, attachmentUrl)

    logger.info('Attachment url updated', {
      uploadUrl,
      attachmentUrl,
      userId,
      todoId
    })
    return uploadUrl
  } catch (e) {
    logger.error((e as Error).message)
    throw new createError.BadRequest(
      'Failed to create attachment presigned url'
    )
  }
}
