import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        referrals: {
          select: { id: true, name: true, email: true, createdAt: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'This email is not registered. Please sign up first.' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Admin hasn't verified your payment yet', user: { id: user.id, isActive: false } },
        { status: 403 }
      )
    }

    const token = generateSessionToken()

    return NextResponse.json({
      message: 'Login successful!',
      token,
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
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
