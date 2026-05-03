import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email zaroori hai' },
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
        { error: 'Yeh email registered nahi hai. Pehle Join karein.' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Admin ne abhi aapki payment verify nahi ki', user: { id: user.id, isActive: false } },
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
      { error: 'Kuch gadbad ho gayi. Dobara try karein.' },
      { status: 500 }
    )
  }
}
