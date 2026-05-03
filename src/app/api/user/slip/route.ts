import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, method, reference } = body

    if (!userId || !method || !reference) {
      return NextResponse.json(
        { error: 'Sab fields zaroori hain' },
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

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User nahi mila' },
        { status: 404 }
      )
    }

    if (user.hasPaidFee) {
      return NextResponse.json(
        { error: 'Aapki fee pehle se pay ho chuki hai' },
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
      message: 'Payment slip successfully submit ho gayi! Admin verify karega.',
      slipId: slip.id
    })
  } catch (error) {
    console.error('Slip error:', error)
    return NextResponse.json(
      { error: 'Kuch gadbad ho gayi. Dobara try karein.' },
      { status: 500 }
    )
  }
}
