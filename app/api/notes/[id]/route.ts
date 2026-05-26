import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, body: noteBody, tags, imageUrl } = body

    const note = await prisma.note.update({
      where: { id },
      data: {
        title,
        body: noteBody,
        imageUrl,
        tags: {
          set: tags?.map((id: string) => ({ id })) ?? [],
        },
      },
      include: { tags: true },
    })
    return NextResponse.json(note)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}