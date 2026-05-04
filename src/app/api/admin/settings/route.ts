import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: '1' } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: '1', referralBonus: 100, minWithdrawal: 500, jazzCashNumber: '03257726221', siteName: 'EarnPro' },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const settings = await prisma.settings.upsert({
      where: { id: '1' },
      update: data,
      create: { id: '1', ...data },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
