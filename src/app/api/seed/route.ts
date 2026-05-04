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
  'Bohat acha platform hai! Highly recommended.',
  'Mene 10 logo refer kiye aur Rs. 500 kama liye!',
  'Amazing! Best earning platform in Pakistan.',
  'Fee sirf Rs. 100 hai aur earning bohat achi hai.',
  'Admin bhi bohat cooperative hai.',
  'Meri payment on-time aa gayi.',
  'Best referral system! Dosto ko invite karo aur kamao.',
  'Trusted platform! Maine pehle bhi try kiya.',
  'Earning potential bohat zyada hai.',
  'Simple aur easy hai. Koi problem nahi aayi.',
  'Reviews dekh ke join kiya aur koi regret nahi.',
  'Sab se acha referral system hai.',
  'Withdrawal bhi bohat fast hai.',
  'Mujhe Rs. 250 mil chuke hain!',
  'Dosto ko bhej ra hoon sab ko.',
  '100% legit platform.',
  'Rs. 100 ki fee mein itna karna bohat acha hai.',
  'Customer support bohat achi hai.',
  'Abhi tak 15 referrals ho gaye hain!',
  'Paisa bilkul milta hai. No scam.',
  'Easiest way to earn money online.',
  'Family ko bhi bata diya hai.',
  'Part time earning ke liye best hai.',
  'Mera experience bohat acha raha.',
  'Thank you EarnPro team!',
  'Withdrawal process bohat smooth hai.',
  'Apna referral code share karo aur kamao.',
  'No fraud, no scam. 100% genuine.',
  'Highly recommend for students!',
  'Pocket money earn karne ke liye perfect.',
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
