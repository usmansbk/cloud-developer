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
    return TodosAccess.getManyByUserId(userId, nextKey, limit)
  } catch (e) {
    logger.error(e)
    throw new createError.BadRequest(e)
  }
}

export const createTodo = async (
  input: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  logger.info('createTodo')
  try {
    return TodosAccess.create({
      ...input,
      userId,
      todoId: uuid.v4(),
      createdAt: new Date().toISOString(),
      done: false
    })
  } catch (e) {
    logger.error(e)
    throw new createError.BadRequest(e)
  }
}

export const updateTodo = async (
  id: string,
  input: UpdateTodoRequest
): Promise<TodoItem> => {
  logger.info('updateTodo')
  try {
    return TodosAccess.update(id, input)
  } catch (e) {
    logger.error(e)
    throw new createError.BadRequest(e)
  }
}

export const deleteTodo = async (id: string) => {
  logger.info('deleteTodo')
  try {
    return TodosAccess.delete(id)
  } catch (e) {
    logger.error(e)
    throw new createError.BadRequest(e)
  }
}
