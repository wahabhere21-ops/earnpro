import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const [totalUsers, totalEarnings, pendingWithdrawals, totalWithdrawn] = await Promise.all([
      prisma.user.count(),
      prisma.user.aggregate({ _sum: { balance: true } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, balance: true, createdAt: true },
    });

    const recentWithdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({
      totalUsers,
      totalEarnings: totalEarnings._sum.balance || 0,
      pendingWithdrawals,
      totalWithdrawn: totalWithdrawn._sum.amount || 0,
      recentUsers,
      recentWithdrawals,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
