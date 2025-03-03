import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export const uploadToS3 = async (file: File): Promise<string> => {
  const fileKey = `pets/${uuidv4()}-${file.name}`

  // File から Buffer へ変換
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type,
  }

  await s3.send(new PutObjectCommand(uploadParams))

  // 署名付き URL の生成
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  })
  return await getSignedUrl(s3, command, { expiresIn: 300 })
}
