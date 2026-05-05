import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateReferralCode } from '@/lib/auth'

export async function GET() {
  try {
    const results: string[] = []

    // Step 1: Drop existing tables (if any)
    try {
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "PaymentSlip" CASCADE`)
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Transaction" CASCADE`)
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Withdrawal" CASCADE`)
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Review" CASCADE`)
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Settings" CASCADE`)
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "_ReferralLink" CASCADE`)
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "User" CASCADE`)
      results.push('Dropped existing tables')
    } catch (e: any) {
      results.push(`Drop tables: ${e.message?.substring(0, 80) || 'error'}`)
    }

    // Step 2: Create all tables
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "password" TEXT,
          "referralCode" TEXT NOT NULL,
          "referredById" TEXT,
          "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "totalWithdrawn" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "role" TEXT NOT NULL DEFAULT 'user',
          "isActive" BOOLEAN NOT NULL DEFAULT false,
          "hasPaidFee" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_email_key" UNIQUE ("email"),
          CONSTRAINT "User_referralCode_key" UNIQUE ("referralCode")
        )
      `)
      await db.$executeRawUnsafe(`
        CREATE TABLE "_ReferralLink" (
          "A" TEXT NOT NULL,
          "B" TEXT NOT NULL,
          CONSTRAINT "_ReferralLink_AB_pkey" PRIMARY KEY ("A","B"),
          CONSTRAINT "_ReferralLink_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "_ReferralLink_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)
      await db.$executeRawUnsafe(`
        CREATE TABLE "PaymentSlip" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL DEFAULT 100,
          "method" TEXT NOT NULL,
          "reference" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "adminNote" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "reviewedAt" TIMESTAMP(3),
          CONSTRAINT "PaymentSlip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)
      await db.$executeRawUnsafe(`
        CREATE TABLE "Transaction" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "type" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)
      await db.$executeRawUnsafe(`
        CREATE TABLE "Withdrawal" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "method" TEXT NOT NULL,
          "account" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "adminNote" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "reviewedAt" TIMESTAMP(3),
          CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)
      await db.$executeRawUnsafe(`
        CREATE TABLE "Review" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "rating" INTEGER NOT NULL,
          "comment" TEXT NOT NULL,
          "avatar" TEXT NOT NULL DEFAULT '',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      await db.$executeRawUnsafe(`
        CREATE TABLE "Settings" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "referralBonus" INTEGER NOT NULL DEFAULT 100,
          "minWithdrawal" INTEGER NOT NULL DEFAULT 500,
          "jazzCashNumber" TEXT NOT NULL DEFAULT '03257726221',
          "siteName" TEXT NOT NULL DEFAULT 'EarnPro',
          "updatedAt" TIMESTAMP(3) NOT NULL
        )
      `)
      results.push('All tables created successfully')
    } catch (e: any) {
      results.push(`Create tables: ${e.message?.substring(0, 100) || 'error'}`)
    }

    // Step 3: Create admin user
    try {
      let adminCode = generateReferralCode()
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
      results.push('Admin user created (wahab@admin.com / wahab444)')
    } catch (e: any) {
      results.push(`Admin: ${e.message?.substring(0, 80) || 'error'}`)
    }

    // Step 4: Create settings
    try {
      await db.settings.create({
        data: {
          id: '1',
          referralBonus: 100,
          minWithdrawal: 500,
          jazzCashNumber: '03257726221',
          siteName: 'EarnPro',
        }
      })
      results.push('Settings created')
    } catch (e: any) {
      results.push(`Settings: ${e.message?.substring(0, 80) || 'error'}`)
    }

    // Step 5: Seed reviews
    try {
      const names = ['Ahmed Ali','Muhammad Usman','Fatima Khan','Sara Ahmed','Ali Hassan','Zainab Malik','Hamza Raza','Ayesha Siddiqui','Bilal Iqbal','Maryam Shah','Omar Farooq','Hira Nawaz','Tariq Mahmood','Sana Javed','Kamran Sheikh']
      const comments = ['Bohat acha platform hai! Highly recommended.','Mene 10 logo refer kiye aur Rs. 500 kama liye!','Amazing! Best earning platform in Pakistan.','Fee sirf Rs. 100 hai aur earning bohat achi hai.','Admin bhi bohat cooperative hai.','Meri payment on-time aa gayi.','Best referral system! Dosto ko invite karo aur kamao.']
      
      const reviews = []
      for (let i = 0; i < 200; i++) {
        const daysAgo = Math.floor(Math.random() * 90) + 1
        reviews.push({
          name: names[i % names.length],
          rating: Math.random() < 0.8 ? 5 : 4,
          comment: comments[i % comments.length],
          avatar: '',
          createdAt: new Date(Date.now() - daysAgo * 86400000),
        })
      }
      
      await db.review.createMany({ data: reviews })
      results.push(`Seeded ${reviews.length} reviews`)
    } catch (e: any) {
      results.push(`Reviews: ${e.message?.substring(0, 80) || 'error'}`)
    }

    return NextResponse.json({ success: true, results, message: 'EarnPro setup complete!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message?.substring(0, 200) || 'Unknown error' }, { status: 500 })
  }
}
