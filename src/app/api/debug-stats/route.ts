import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const totalUsers = await db.user.count();
    const totalEarnings = await db.user.aggregate({ _sum: { walletBalance: true } });
    const pendingWithdrawals = await db.withdrawal.count({ where: { status: "PENDING" } });
    
    return NextResponse.json({
      totalUsers,
      totalEarnings,
      pendingWithdrawals,
      rawEarnings: JSON.stringify(totalEarnings),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
