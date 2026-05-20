import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(tags)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { label, color } = body

    const tag = await prisma.tag.create({
      data: { label, color },
    })
    return NextResponse.json(tag, { status: 201 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}