// =============================================
// FILE: app/api/loans/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/loans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const loans = await prisma.loan.findMany({
      where: {
        ...(userId && { userId: parseInt(userId) }),
        ...(status && { status: status as any }),
      },
      include: {
        user: true,
        equipment: true,
      },
    });

    return NextResponse.json(loans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

// POST /api/loans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, equipmentId, loanDate, status } = body;

    const loan = await prisma.loan.create({
      data: {
        userId,
        equipmentId,
        loanDate,
        status,
      },
      include: {
        user: true,
        equipment: true,
      },
    });

    // Update equipment status to ON_LOAN
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { status: 'ON_LOAN' },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }
}