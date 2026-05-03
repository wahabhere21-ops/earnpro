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

    const totalUsers = await db.user.count({ where: { role: 'user' } })
    const activeUsers = await db.user.count({ where: { role: 'user', isActive: true } })
    const pendingSlips = await db.paymentSlip.count({ where: { status: 'pending' } })
    const pendingWithdrawals = await db.withdrawal.count({ where: { status: 'pending' } })

    const feePayments = await db.paymentSlip.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    })

    const withdrawalPayments = await db.withdrawal.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    })

    const totalRevenue = feePayments._sum.amount || 0
    const totalPaid = withdrawalPayments._sum.amount || 0
    const adminProfit = totalRevenue - totalPaid

    const recentUsers = await db.user.findMany({
      where: { role: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        referrals: { select: { id: true } },
        _count: { select: { referrals: true } }
      }
    })

    const topReferrers = await db.user.findMany({
      where: { role: 'user' },
      orderBy: { walletBalance: 'desc' },
      take: 5,
      include: {
        _count: { select: { referrals: true } }
      }
    })

    const pendingSlipList = await db.paymentSlip.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const pendingWithdrawalList = await db.withdrawal.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRevenue,
      totalPaid,
      adminProfit,
      pendingSlips,
      pendingWithdrawals,
      recentUsers,
      topReferrers,
      pendingSlipList,
      pendingWithdrawalList,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
