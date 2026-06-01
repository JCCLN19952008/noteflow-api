import { NextRequest } from 'next/server'
import { DELETE } from '@/app/api/tags/[id]/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      delete: jest.fn(),
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

describe('DELETE /api/tags/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deletes a tag successfully', async () => {
    ;(prisma.tag.delete as jest.Mock).mockResolvedValue(mockTag)

    const request = new NextRequest(
      'http://localhost:3000/api/tags/tag-id-123',
      { method: 'DELETE' }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'tag-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns 500 if delete fails', async () => {
    ;(prisma.tag.delete as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest(
      'http://localhost:3000/api/tags/tag-id-123',
      { method: 'DELETE' }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'tag-id-123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to delete tag')
  })
})