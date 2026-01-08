import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Light touch query — Postgres equivalent of SELECT 1
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "database" });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, service: "database", error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
