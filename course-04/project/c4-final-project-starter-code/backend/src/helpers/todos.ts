import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger(process.env.APP_NAME)

export const getTodosForUser = async (id: string) => {
  logger.info(id)
}

export const createTodo = async (input: CreateTodoRequest, userId: string) => {
  logger.info({ ...input, userId, id: uuid() })
}

export const updateTodo = async (id: string, input: UpdateTodoRequest) => {
  logger.info({
    id,
    ...input
  })
}

export const deleteTodo = async (id: string) => {
  logger.info(id)
}
