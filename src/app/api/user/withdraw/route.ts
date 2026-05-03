import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, method, account } = body

    if (!userId || !amount || !method || !account) {
      return NextResponse.json(
        { error: 'Sab fields zaroori hain' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        referrals: { select: { id: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User nahi mila' }, { status: 404 })
    }

    if (user.referrals.length < 5) {
      return NextResponse.json(
        { error: 'Minimum 5 referrals chahiye withdrawal ke liye' },
        { status: 400 }
      )
    }

    if (user.walletBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    const validMethods = ['jazzcash', 'easypaisa', 'bank']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Ghalat payment method' },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: amount } }
    })

    const withdrawal = await db.withdrawal.create({
      data: {
        userId,
        amount,
        method,
        account,
        status: 'pending',
      }
    })

    await db.transaction.create({
      data: {
        userId,
        amount: -amount,
        type: 'withdrawal',
        description: `Withdrawal request - ${method} (${account.slice(-4)})`,
      }
    })

    return NextResponse.json({
      message: 'Withdrawal request successfully submit ho gayi!',
      newBalance: updatedUser.walletBalance,
      withdrawalId: withdrawal.id,
    })
  } catch (error) {
    console.error('Withdraw error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
