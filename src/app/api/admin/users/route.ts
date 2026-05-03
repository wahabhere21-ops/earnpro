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

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { referrals: true } },
        paymentSlips: {
          select: { status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, targetUserId } = body

    if (!adminId || !targetUserId) {
      return NextResponse.json({ error: 'Sab fields zaroori hain' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User nahi mila' }, { status: 404 })
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { isActive: !targetUser.isActive }
    })

    return NextResponse.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'}`,
      isActive: updatedUser.isActive
    })
  } catch (error) {
    console.error('Admin toggle user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
