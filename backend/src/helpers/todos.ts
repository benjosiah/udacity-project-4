import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('todos')


export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    return todosAccess.getAllTodos(userId)
}

export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    logger.info('Creating a new todo')
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: '',
        ...newTodo
    }
    return todosAccess.createTodoItem(newItem)
}

export async function updateTodo(
    todoId: string,
    updatedTodo: UpdateTodoRequest,
    userId: string
): Promise<TodoItem> {
    logger.info('Updating a todo')
    return todosAccess.updateTodoItem(todoId, updatedTodo, userId)
}

export async function deleteTodo(
    todoId: string,
    userId: string
): Promise<void> {
    logger.info('Deleting a todo')
    return todosAccess.deleteTodoItem(todoId, userId)
}

export async function generateUploadUrl(
    todoId: string,
): Promise<string> {
    logger.info('Generating upload url')
    return attachmentUtils.getUploadUrl(todoId)
}

export async function updateAttachmentUrl(
    todoId: string,
): Promise<String> {
    logger.info('Updating attachment url')
    return todosAccess.updateAttachmentUrl(todoId)
}



