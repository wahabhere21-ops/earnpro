import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, withdrawalId, action, adminNote } = body

    if (!adminId || !withdrawalId || !action) {
      return NextResponse.json({ error: 'Sab fields zaroori hain' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id: withdrawalId }
    })

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal nahi mili' }, { status: 404 })
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Yeh withdrawal pehle se process ho chuki hai' }, { status: 400 })
    }

    if (action === 'approve') {
      await db.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'approved',
          adminNote: adminNote || 'Approved',
          reviewedAt: new Date()
        }
      })

      await db.user.update({
        where: { id: withdrawal.userId },
        data: { totalWithdrawn: { increment: withdrawal.amount } }
      })

      return NextResponse.json({ message: 'Withdrawal approved!' })
    } else if (action === 'reject') {
      await db.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'rejected',
          adminNote: adminNote || 'Rejected',
          reviewedAt: new Date()
        }
      })

      // Refund wallet balance
      await db.user.update({
        where: { id: withdrawal.userId },
        data: { walletBalance: { increment: withdrawal.amount } }
      })

      await db.transaction.create({
        data: {
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          type: 'refund',
          description: 'Withdrawal rejected - Amount refunded to wallet',
        }
      })

      return NextResponse.json({ message: 'Withdrawal rejected. Balance refunded.' })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Withdrawal admin error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
