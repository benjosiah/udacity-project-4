import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { Types } from 'aws-sdk/clients/s3'

const AWSXRay = require ('aws-xray-sdk') 

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_INDEX,
        private readonly s3Client: Types = new AWS.S3({
            signatureVersion: 'v4'
        }),
            
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    ) {}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating a new todo')

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodoItem(todoId: string, updatedTodo: TodoUpdate, userId: string): Promise<TodoItem> {
        logger.info('Updating a todo')

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: 'ALL_NEW'
        }).promise()

        return result.Attributes as TodoItem
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<void> {
        logger.info('Deleting a todo')

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
    }

    async updateAttachmentUrl(todoId: string): Promise<String> {
        logger.info('Updating attachment url')


        const uploadUrl = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: 300
        })

        return uploadUrl

        
    }
}


function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        const client  = new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })

        return client
    }

    return new XAWS.DynamoDB.DocumentClient()
}



