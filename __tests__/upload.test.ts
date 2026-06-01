import { NextRequest } from 'next/server'
import { POST } from '@/app/api/upload/route'

// Mock AWS S3
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://noteflow-images.s3.eu-central-1.amazonaws.com/user-123/123456.jpg',
      }),
    }),
  })),
}))

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if file is missing', async () => {
    const formData = new FormData()
    formData.append('userId', 'user-123')

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('file and userId are required')
  })

  it('returns 400 if userId is missing', async () => {
    const formData = new FormData()
    const blob = new Blob(['test image content'], { type: 'image/jpeg' })
    formData.append('file', blob, 'test.jpg')

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('file and userId are required')
  })

  it('uploads successfully and returns URL', async () => {
    const formData = new FormData()
    const blob = new Blob(['test image content'], { type: 'image/jpeg' })
    formData.append('file', blob, 'test.jpg')
    formData.append('userId', 'user-123')

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe(
      'https://noteflow-images.s3.eu-central-1.amazonaws.com/user-123/123456.jpg'
    )
  })
})