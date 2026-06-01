import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/notes/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockNote = {
  id: 'test-id-123',
  userId: 'user-123',
  title: 'Test Note',
  body: 'Test body content',
  pinned: false,
  imageUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  tags: [],
}

describe('GET /api/notes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/notes')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('returns notes for a valid userId', async () => {
    ;(prisma.note.findMany as jest.Mock).mockResolvedValue([mockNote])

    const request = new NextRequest(
      'http://localhost:3000/api/notes?userId=user-123'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].title).toBe('Test Note')
  })

  it('returns empty array when user has no notes', async () => {
    ;(prisma.note.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest(
      'http://localhost:3000/api/notes?userId=user-123'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(0)
  })
})

describe('POST /api/notes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Note',
        body: 'Test body',
        tags: [],
        pinned: false,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('creates a note successfully', async () => {
    ;(prisma.note.create as jest.Mock).mockResolvedValue(mockNote)

    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Note',
        body: 'Test body',
        tags: [],
        pinned: false,
        userId: 'user-123',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('Test Note')
    expect(data.userId).toBe('user-123')
  })
})