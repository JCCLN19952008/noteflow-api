import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const notes = await prisma.note.findMany({
      where: { userId },
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(notes)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, body: noteBody, tags, pinned, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        body: noteBody,
        pinned: pinned ?? false,
        tags: {
          connect: tags?.map((id: string) => ({ id })) ?? [],
        },
      },
      include: { tags: true },
    })
    return NextResponse.json(note, { status: 201 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}