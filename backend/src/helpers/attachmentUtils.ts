import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
    constructor(
        private readonly s3 = createS3Bucket(),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}

    getUploadUrl(todoId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration) || 300 // 5 minutes
        
        })
    }

    async deleteFile(todoId: string) {
        await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: todoId
        }).promise()
    }

    getAttachmentUrl(todoId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }
}

function createS3Bucket() {
    return new XAWS.S3({
        signatureVersion: 'v4'
    })
}



