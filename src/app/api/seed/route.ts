import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateReferralCode } from '@/lib/auth'

const PAKISTANI_NAMES = [
  'Ahmed Ali', 'Muhammad Usman', 'Fatima Khan', 'Sara Ahmed', 'Ali Hassan',
  'Zainab Malik', 'Hamza Raza', 'Ayesha Siddiqui', 'Bilal Iqbal', 'Maryam Shah',
  'Omar Farooq', 'Hira Nawaz', 'Tariq Mahmood', 'Sana Javed', 'Kamran Sheikh',
  'Nadia Ashraf', 'Imran Khan', 'Rabia Bukhari', 'Farhan Ali', 'Parveen Akhtar',
  'Hassan Mohsin', 'Amina Yousuf', 'Danish Rauf', 'Kiran Batool', 'Shahid Afridi',
  'Sobia Iqbal', 'Waqar Ahmed', 'Nargis Parveen', 'Rashid Khan', 'Samina Kausar',
]

const REVIEW_COMMENTS = [
  'Great platform! Highly recommended.',
  'Referred 10 people and earned Rs. 500!',
  'Amazing! Best earning platform in Pakistan.',
  'Fee is only Rs. 100 and earnings are great.',
  'Admin is very cooperative.',
  'My payment arrived on time.',
  'Best referral system! Invite friends and earn.',
  'Trusted platform! I've used it before.',
  'Earning potential is very high.',
  'Simple and easy. No issues at all.',
  'Joined after reading reviews, no regrets.',
  'This is the best referral system.',
  'Withdrawal is also very fast.',
  'I've already received Rs. 250!',
  'Sending it to all my friends.',
  '100% legit platform.',
  'Getting this much for Rs. 100 fee is amazing.',
  'Customer support is excellent.',
  'Already got 15 referrals!',
  'Money definitely comes. No scam.',
  'Easiest way to earn money online.',
  'Told my family about it too.',
  'Part time earning ke liye best hai.',
  'My experience has been great.',
  'Thank you EarnPro team!',
  'Withdrawal process is very smooth.',
  'Share your referral code and earn.',
  'No fraud, no scam. 100% genuine.',
  'Highly recommend for students!',
  'Perfect for earning pocket money.',
]

function randomDate(daysAgo: number): Date {
  const now = new Date()
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return past
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function GET() {
  try {
    // Create admin if not exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'wahab@admin.com' }
    })

    if (!existingAdmin) {
      let adminCode = generateReferralCode()
      let codeExists = await db.user.findUnique({ where: { referralCode: adminCode } })
      while (codeExists) {
        adminCode = generateReferralCode()
        codeExists = await db.user.findUnique({ where: { referralCode: adminCode } })
      }

      await db.user.create({
        data: {
          name: 'Wahab Admin',
          email: 'wahab@admin.com',
          password: hashPassword('wahab444'),
          referralCode: adminCode,
          role: 'admin',
          isActive: true,
          hasPaidFee: true,
          walletBalance: 0,
          totalWithdrawn: 0,
        }
      })
    }

    // Seed reviews
    const existingReviews = await db.review.count()

    if (existingReviews === 0) {
      const reviewsToCreate = 500
      const batchSize = 100

      for (let i = 0; i < reviewsToCreate; i += batchSize) {
        const batch = []
        for (let j = i; j < Math.min(i + batchSize, reviewsToCreate); j++) {
          const name = PAKISTANI_NAMES[j % PAKISTANI_NAMES.length]
          const comment = REVIEW_COMMENTS[j % REVIEW_COMMENTS.length]
          const rating = Math.random() < 0.8 ? 5 : 4
          const daysAgo = randomInt(1, 90)
          const createdAt = randomDate(daysAgo)

          batch.push({
            name,
            rating,
            comment,
            createdAt,
          })
        }

        await db.review.createMany({ data: batch })
      }
    }

    // Create default settings
    await db.settings.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        referralBonus: 100,
        minWithdrawal: 500,
        jazzCashNumber: '03257726221',
        siteName: 'EarnPro',
      },
    })

    return NextResponse.json({
      message: 'Seed complete! Admin created, reviews seeded, settings created.',
      reviewCount: await db.review.count(),
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
