import { NextResponse } from 'next/server'
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json({ error: 'file and userId are required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${userId}/${Date.now()}.jpg`

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: 'image/jpeg',
    }

    const result = await s3.upload(params).promise()
    return NextResponse.json({ url: result.Location })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}