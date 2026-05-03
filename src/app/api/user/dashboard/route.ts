import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: { id: true, name: true, email: true, createdAt: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User nahi mila' }, { status: 404 })
    }

    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const withdrawals = await db.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const referralCount = user.referrals.length
    const canWithdraw = referralCount >= 5
    const nextBonusAt = referralCount < 10 ? 10 : referralCount < 15 ? 15 : referralCount < 20 ? 20 : null

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        referredById: user.referredById,
        walletBalance: user.walletBalance,
        totalWithdrawn: user.totalWithdrawn,
        role: user.role,
        isActive: user.isActive,
        hasPaidFee: user.hasPaidFee,
        createdAt: user.createdAt,
      },
      referralCount,
      canWithdraw,
      nextBonusAt,
      referrals: user.referrals,
      transactions,
      withdrawals,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
