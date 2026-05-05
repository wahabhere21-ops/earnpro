import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count()
    ])

    return NextResponse.json({ reviews, total, page, limit })
  } catch (error) {
    console.error('Admin reviews GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, name, rating, comment } = body

    if (!adminId || !name || !rating || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const review = await db.review.create({
      data: { name, rating: Number(rating), comment }
    })

    return NextResponse.json({ message: 'Review added!', review })
  } catch (error) {
    console.error('Admin reviews POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, reviewId } = body

    if (!adminId || !reviewId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await db.review.delete({ where: { id: reviewId } })

    return NextResponse.json({ message: 'Review deleted!' })
  } catch (error) {
    console.error('Admin reviews DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
