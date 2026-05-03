import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateReferralCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, referralCode } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name aur email zaroori hain' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ghalat email format' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Yeh email pehle se registered hai. Login karein.', user: existingUser },
        { status: 409 }
      )
    }

    // Free login check - @freelogin.com emails auto-activate without payment
    const isFreeLogin = email.toLowerCase().endsWith('@freelogin.com')

    let referredById: string | null = null
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode }
      })
      if (referrer) {
        referredById = referrer.id
      }
    }

    let newCode = generateReferralCode()
    let codeExists = await db.user.findUnique({ where: { referralCode: newCode } })
    while (codeExists) {
      newCode = generateReferralCode()
      codeExists = await db.user.findUnique({ where: { referralCode: newCode } })
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        referralCode: newCode,
        referredById,
        isActive: isFreeLogin,
        hasPaidFee: isFreeLogin,
        walletBalance: 0,
        totalWithdrawn: 0,
        role: 'user',
      }
    })

    // If free login and has referrer, credit referrer Rs. 50
    if (isFreeLogin && referredById) {
      const referrer = await db.user.findUnique({
        where: { id: referredById }
      })

      if (referrer) {
        await db.user.update({
          where: { id: referrer.id },
          data: { walletBalance: { increment: 50 } }
        })

        await db.transaction.create({
          data: {
            userId: referrer.id,
            amount: 50,
            type: 'referral_bonus',
            description: `Rs. 50 referral bonus - ${name} joined`,
          }
        })

        // Check 10-referral milestone bonus
        const paidRefCount = await db.user.count({
          where: { referredById: referrer.id, hasPaidFee: true }
        })
        if (paidRefCount === 10) {
          await db.user.update({
            where: { id: referrer.id },
            data: { walletBalance: { increment: 50 } }
          })
          await db.transaction.create({
            data: {
              userId: referrer.id,
              amount: 50,
              type: 'milestone_bonus',
              description: 'Rs. 50 milestone bonus - 10 referrals completed!',
            }
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Account successfully create ho gaya!',
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
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Kuch gadbad ho gayi. Dobara try karein.' },
      { status: 500 }
    )
  }
}
