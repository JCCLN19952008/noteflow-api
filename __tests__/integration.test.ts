import { NextRequest } from 'next/server'
import { GET as getNotes, POST as createNote } from '@/app/api/notes/route'
import { GET as getTags, POST as createTag } from '@/app/api/tags/route'
import { PATCH as updateNote, DELETE as deleteNote } from '@/app/api/notes/[id]/route'
import { PATCH as togglePin } from '@/app/api/notes/[id]/pin/route'
import { DELETE as deleteTag } from '@/app/api/tags/[id]/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const userId = 'integration-test-user'

const mockTag = {
  id: 'tag-id-123',
  userId,
  label: 'Work',
  color: '#6C47FF',
  createdAt: new Date('2026-01-01'),
}

const mockNote = {
  id: 'note-id-123',
  userId,
  title: 'Integration Test Note',
  body: 'This is an integration test',
  pinned: false,
  imageUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  tags: [mockTag],
}

describe('Integration — Notes and Tags workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a tag then creates a note with that tag attached', async () => {
    // Step 1 — create a tag
    ;(prisma.tag.create as jest.Mock).mockResolvedValue(mockTag)

    const tagRequest = new NextRequest('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({ label: 'Work', color: '#6C47FF', userId }),
    })
    const tagResponse = await createTag(tagRequest)
    const tag = await tagResponse.json()

    expect(tagResponse.status).toBe(201)
    expect(tag.label).toBe('Work')

    // Step 2 — create a note with that tag
    ;(prisma.note.create as jest.Mock).mockResolvedValue(mockNote)

    const noteRequest = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Integration Test Note',
        body: 'This is an integration test',
        tags: [tag.id],
        pinned: false,
        userId,
      }),
    })
    const noteResponse = await createNote(noteRequest)
    const note = await noteResponse.json()

    expect(noteResponse.status).toBe(201)
    expect(note.title).toBe('Integration Test Note')
    expect(note.tags).toHaveLength(1)
    expect(note.tags[0].label).toBe('Work')
  })

  it('creates a note, pins it, then fetches it pinned', async () => {
    // Step 1 — create a note
    ;(prisma.note.create as jest.Mock).mockResolvedValue(mockNote)

    const noteRequest = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Integration Test Note',
        body: 'This is an integration test',
        tags: [],
        pinned: false,
        userId,
      }),
    })
    const noteResponse = await createNote(noteRequest)
    const note = await noteResponse.json()
    expect(note.pinned).toBe(false)

    // Step 2 — pin the note
    ;(prisma.note.findUnique as jest.Mock).mockResolvedValue(mockNote)
    ;(prisma.note.update as jest.Mock).mockResolvedValue({
      ...mockNote,
      pinned: true,
    })

    const pinRequest = new NextRequest(
      `http://localhost:3000/api/notes/${note.id}/pin`,
      { method: 'PATCH' }
    )
    const pinResponse = await togglePin(pinRequest, {
      params: Promise.resolve({ id: note.id }),
    })
    const pinnedNote = await pinResponse.json()
    expect(pinnedNote.pinned).toBe(true)

    // Step 3 — fetch notes and verify pinned note is there
    ;(prisma.note.findMany as jest.Mock).mockResolvedValue([
      { ...mockNote, pinned: true },
    ])

    const getRequest = new NextRequest(
      `http://localhost:3000/api/notes?userId=${userId}`
    )
    const getResponse = await getNotes(getRequest)
    const notes = await getResponse.json()

    expect(notes).toHaveLength(1)
    expect(notes[0].pinned).toBe(true)
  })

  it('creates a note then deletes it and verifies it is gone', async () => {
    // Step 1 — create a note
    ;(prisma.note.create as jest.Mock).mockResolvedValue(mockNote)

    const noteRequest = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Note to delete',
        body: 'Will be deleted',
        tags: [],
        pinned: false,
        userId,
      }),
    })
    const noteResponse = await createNote(noteRequest)
    const note = await noteResponse.json()
    expect(noteResponse.status).toBe(201)

    // Step 2 — delete the note
    ;(prisma.note.delete as jest.Mock).mockResolvedValue(mockNote)

    const deleteRequest = new NextRequest(
      `http://localhost:3000/api/notes/${note.id}`,
      { method: 'DELETE' }
    )
    const deleteResponse = await deleteNote(deleteRequest, {
      params: Promise.resolve({ id: note.id }),
    })
    expect(deleteResponse.status).toBe(200)

    // Step 3 — fetch notes and verify empty
    ;(prisma.note.findMany as jest.Mock).mockResolvedValue([])

    const getRequest = new NextRequest(
      `http://localhost:3000/api/notes?userId=${userId}`
    )
    const getResponse = await getNotes(getRequest)
    const notes = await getResponse.json()

    expect(notes).toHaveLength(0)
  })

  it('creates a note, updates it, and verifies the changes', async () => {
    // Step 1 — create a note
    ;(prisma.note.create as jest.Mock).mockResolvedValue(mockNote)

    const noteRequest = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Original Title',
        body: 'Original body',
        tags: [],
        pinned: false,
        userId,
      }),
    })
    const noteResponse = await createNote(noteRequest)
    const note = await noteResponse.json()

    // Step 2 — update the note
    const updatedNote = {
      ...mockNote,
      title: 'Updated Title',
      body: 'Updated body',
    }
    ;(prisma.note.update as jest.Mock).mockResolvedValue(updatedNote)

    const updateRequest = new NextRequest(
      `http://localhost:3000/api/notes/${note.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Updated Title',
          body: 'Updated body',
          tags: [],
        }),
      }
    )
    const updateResponse = await updateNote(updateRequest, {
      params: Promise.resolve({ id: note.id }),
    })
    const updated = await updateResponse.json()

    expect(updateResponse.status).toBe(200)
    expect(updated.title).toBe('Updated Title')
    expect(updated.body).toBe('Updated body')
  })

  it('creates a tag, attaches to note, deletes tag, verifies note tags empty', async () => {
    // Step 1 — create tag
    ;(prisma.tag.create as jest.Mock).mockResolvedValue(mockTag)
    const tagRequest = new NextRequest('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({ label: 'Work', color: '#6C47FF', userId }),
    })
    const tagResponse = await createTag(tagRequest)
    const tag = await tagResponse.json()
    expect(tagResponse.status).toBe(201)

    // Step 2 — delete the tag
    ;(prisma.tag.delete as jest.Mock).mockResolvedValue(mockTag)
    const deleteTagRequest = new NextRequest(
      `http://localhost:3000/api/tags/${tag.id}`,
      { method: 'DELETE' }
    )
    const deleteTagResponse = await deleteTag(deleteTagRequest, {
      params: Promise.resolve({ id: tag.id }),
    })
    expect(deleteTagResponse.status).toBe(200)

    // Step 3 — fetch tags and verify empty
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue([])
    const getTagsRequest = new NextRequest(
      `http://localhost:3000/api/tags?userId=${userId}`
    )
    const getTagsResponse = await getTags(getTagsRequest)
    const tags = await getTagsResponse.json()
    expect(tags).toHaveLength(0)
  })
})