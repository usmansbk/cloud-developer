import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { Key } from 'aws-sdk/clients/dynamodb'

// TODO: Implement businessLogic

const logger = createLogger('businessLogic')

export const getTodosForUser = async (
  userId: string,
  nextKey: Key | null,
  limit: number
): Promise<{ items: TodoItem[]; nextKey: string | null }> => {
  logger.info('getTodosForUser')
  try {
    const result = await TodosAccess.getManyByUserId(userId, nextKey, limit)

    if (result.items.length === 0) {
      throw new createError.NotFound("You haven't created any todos yet")
    }
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
    const todo = await TodosAccess.create({
      ...input,
      userId,
      todoId: uuid.v4(),
      createdAt: new Date().toISOString(),
      done: false
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
  input: UpdateTodoRequest
): Promise<TodoItem> => {
  logger.info('updateTodo')
  try {
    const isValidTodoId = await TodosAccess.exists(todoId)

    if (!isValidTodoId) {
      throw new createError.BadRequest('Invalid Todo ID')
    }

    const todo = await TodosAccess.update(todoId, userId, input)

    return todo
  } catch (e) {
    logger.error((e as Error).message)
    throw e
  }
}

export const deleteTodo = async (todoId: string, userId: string) => {
  logger.info('deleteTodo')
  try {
    const todo = await TodosAccess.delete(todoId, userId)

    return todo
  } catch (e) {
    logger.error((e as Error).message)
    throw new createError.BadRequest('Failed to delete todo')
  }
}
