import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status: status as any } : {};

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({ withdrawals, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (status === 'APPROVED') {
      const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
      if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: { balance: { decrement: withdrawal.amount } },
      });
    }

    await prisma.withdrawal.update({
      where: { id },
      data: { status, processedAt: new Date() },
    });

    return NextResponse.json({ message: `Withdrawal ${status.toLowerCase()}` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
  }
}
