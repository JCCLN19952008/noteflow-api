import { NextRequest } from 'next/server'
import { PATCH, DELETE } from '@/app/api/notes/[id]/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockNote = {
  id: 'test-id-123',
  userId: 'user-123',
  title: 'Updated Note',
  body: 'Updated body',
  pinned: false,
  imageUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  tags: [],
}

describe('PATCH /api/notes/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates a note successfully', async () => {
    ;(prisma.note.update as jest.Mock).mockResolvedValue(mockNote)

    const request = new NextRequest(
      'http://localhost:3000/api/notes/test-id-123',
      {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Updated Note',
          body: 'Updated body',
          tags: [],
        }),
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'test-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.title).toBe('Updated Note')
  })

  it('updates a note with imageUrl', async () => {
    const noteWithImage = {
      ...mockNote,
      imageUrl: 'https://s3.amazonaws.com/test.jpg',
    }
    ;(prisma.note.update as jest.Mock).mockResolvedValue(noteWithImage)

    const request = new NextRequest(
      'http://localhost:3000/api/notes/test-id-123',
      {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Updated Note',
          body: 'Updated body',
          tags: [],
          imageUrl: 'https://s3.amazonaws.com/test.jpg',
        }),
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'test-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.imageUrl).toBe('https://s3.amazonaws.com/test.jpg')
  })
})

describe('DELETE /api/notes/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deletes a note successfully', async () => {
    ;(prisma.note.delete as jest.Mock).mockResolvedValue(mockNote)

    const request = new NextRequest(
      'http://localhost:3000/api/notes/test-id-123',
      { method: 'DELETE' }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'test-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})