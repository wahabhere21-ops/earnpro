import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, slipId, action, adminNote } = body

    if (!adminId || !slipId || !action) {
      return NextResponse.json({ error: 'Sab fields zaroori hain' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const slip = await db.paymentSlip.findUnique({
      where: { id: slipId },
      include: { user: true }
    })

    if (!slip) {
      return NextResponse.json({ error: 'Slip nahi mili' }, { status: 404 })
    }

    if (slip.status !== 'pending') {
      return NextResponse.json({ error: 'Yeh slip pehle se process ho chuki hai' }, { status: 400 })
    }

    if (action === 'approve') {
      await db.paymentSlip.update({
        where: { id: slipId },
        data: {
          status: 'approved',
          adminNote: adminNote || 'Approved',
          reviewedAt: new Date()
        }
      })

      await db.user.update({
        where: { id: slip.userId },
        data: {
          isActive: true,
          hasPaidFee: true
        }
      })

      await db.transaction.create({
        data: {
          userId: slip.userId,
          amount: 0,
          type: 'fee_payment',
          description: 'Registration fee Rs. 100 paid - Account activated',
        }
      })

      // Credit referrer Rs. 50 if user was referred
      if (slip.user.referredById) {
        const referrer = await db.user.findUnique({
          where: { id: slip.user.referredById },
          include: {
            referrals: { select: { id: true, hasPaidFee: true } }
          }
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
              description: `Rs. 50 referral bonus - ${slip.user.name} joined`,
            }
          })

          // Check milestone bonus (10 referrals with paid fees)
          const allPaidReferrals = await db.user.count({
            where: {
              referredById: referrer.id,
              hasPaidFee: true
            }
          })

          if (allPaidReferrals === 10) {
            // 10 referrals milestone: Rs. 50 extra bonus (total Rs. 500 = 10*50 + 50 bonus)
            await db.user.update({
              where: { id: referrer.id },
              data: { walletBalance: { increment: 50 } }
            })

            await db.transaction.create({
              data: {
                userId: referrer.id,
                amount: 50,
                type: 'milestone_bonus',
                description: 'Rs. 50 milestone bonus - 10 referrals completed! Total: Rs. 500',
              }
            })
          }
        }
      }

      return NextResponse.json({ message: 'Payment approved! User activated.' })
    } else if (action === 'reject') {
      await db.paymentSlip.update({
        where: { id: slipId },
        data: {
          status: 'rejected',
          adminNote: adminNote || 'Rejected',
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({ message: 'Payment rejected.' })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
