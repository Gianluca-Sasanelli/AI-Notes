import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const S3_ENDPOINT = process.env.S3_ENDPOINT
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY
const S3_SECRET_KEY = process.env.S3_SECRET_KEY
const S3_BUCKET = process.env.S3_BUCKET

if (!S3_ENDPOINT) {
  throw new Error("Missing required environment variable: S3_ENDPOINT")
}
if (!S3_ACCESS_KEY) {
  throw new Error("Missing required environment variable: S3_ACCESS_KEY")
}
if (!S3_SECRET_KEY) {
  throw new Error("Missing required environment variable: S3_SECRET_KEY")
}
if (!S3_BUCKET) {
  throw new Error("Missing required environment variable: S3_BUCKET")
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY
  },
  forcePathStyle: true
})

export const uploadFile = async (
  userId: string,
  noteId: number,
  filename: string,
  file: Buffer,
  contentType: string
) => {
  const key = `${userId}/notes/${noteId}/${filename}`
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType
    })
  )
  return key
}

export const deleteFile = async (userId: string, noteId: number, filename: string) => {
  const key = `${userId}/notes/${noteId}/${filename}`
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key
    })
  )
}

export const getFileUrl = async (userId: string, noteId: number, filename: string) => {
  const key = `${userId}/notes/${noteId}/${filename}`
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key
  })
  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}
