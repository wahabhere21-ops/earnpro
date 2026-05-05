import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, method, reference } = body

    if (!userId || !method || !reference) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const validMethods = ['jazzcash', 'easypaisa', 'bank']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.hasPaidFee) {
      return NextResponse.json(
        { error: 'Your fee has already been paid' },
        { status: 400 }
      )
    }

    const slip = await db.paymentSlip.create({
      data: {
        userId,
        amount: 100,
        method,
        reference,
        status: 'pending',
      }
    })

    return NextResponse.json({
      message: 'Payment slip submitted successfully! Admin will verify.',
      slipId: slip.id
    })
  } catch (error) {
    console.error('Slip error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
