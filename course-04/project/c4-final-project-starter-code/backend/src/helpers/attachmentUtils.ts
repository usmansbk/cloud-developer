import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const bucket = process.env.ATTACHMENT_S3_BUCKET
const expires = process.env.SIGNED_URL_EXPIRATION

AWSXRay.captureAWS(AWS)

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export function getUploadUrl(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Expires: expires,
    Key: todoId
  })
}

export function getAttachmentUrl(attachmentKey: string): string {
  return `https://${bucket}.s3.amazonaws.com/${attachmentKey}`
}
