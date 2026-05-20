import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.tag.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}