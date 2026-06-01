import { NextRequest } from 'next/server'
import { PATCH } from '@/app/api/notes/[id]/pin/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockNote = {
  id: 'test-id-123',
  userId: 'user-123',
  title: 'Test Note',
  body: 'Test body',
  pinned: false,
  imageUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  tags: [],
}

describe('PATCH /api/notes/[id]/pin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('pins an unpinned note', async () => {
    ;(prisma.note.findUnique as jest.Mock).mockResolvedValue(mockNote)
    ;(prisma.note.update as jest.Mock).mockResolvedValue({
      ...mockNote,
      pinned: true,
    })

    const request = new NextRequest(
      'http://localhost:3000/api/notes/test-id-123/pin',
      { method: 'PATCH' }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'test-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.pinned).toBe(true)
  })

  it('unpins a pinned note', async () => {
    ;(prisma.note.findUnique as jest.Mock).mockResolvedValue({
      ...mockNote,
      pinned: true,
    })
    ;(prisma.note.update as jest.Mock).mockResolvedValue({
      ...mockNote,
      pinned: false,
    })

    const request = new NextRequest(
      'http://localhost:3000/api/notes/test-id-123/pin',
      { method: 'PATCH' }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'test-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.pinned).toBe(false)
  })

  it('returns 404 if note not found', async () => {
    ;(prisma.note.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/notes/nonexistent-id/pin',
      { method: 'PATCH' }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'nonexistent-id' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Note not found')
  })
})