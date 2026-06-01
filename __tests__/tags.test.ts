import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/tags/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockTag = {
  id: 'tag-id-123',
  userId: 'user-123',
  label: 'Work',
  color: '#6C47FF',
  createdAt: new Date('2026-01-01'),
}

describe('GET /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/tags')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('returns tags for a valid userId', async () => {
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue([mockTag])

    const request = new NextRequest(
      'http://localhost:3000/api/tags?userId=user-123'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].label).toBe('Work')
  })

  it('returns empty array when user has no tags', async () => {
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest(
      'http://localhost:3000/api/tags?userId=user-123'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(0)
  })
})

describe('POST /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        label: 'Work',
        color: '#6C47FF',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('creates a tag successfully', async () => {
    ;(prisma.tag.create as jest.Mock).mockResolvedValue(mockTag)

    const request = new NextRequest('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        label: 'Work',
        color: '#6C47FF',
        userId: 'user-123',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.label).toBe('Work')
    expect(data.userId).toBe('user-123')
  })
})