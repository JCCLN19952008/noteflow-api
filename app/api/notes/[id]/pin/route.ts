import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    const updated = await prisma.note.update({
      where: { id },
      data: { pinned: !note.pinned },
      include: { tags: true },
    })
    return NextResponse.json(updated)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 })
  }
}