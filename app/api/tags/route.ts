import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const tags = await prisma.tag.findMany({
      where: { userId },
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
    const { label, color, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: { label, color, userId },
    })
    return NextResponse.json(tag, { status: 201 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}