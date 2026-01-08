// =============================================
// FILE: app/api/purchases/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/purchases
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const purchases = await prisma.purchase.findMany({
      where: {
        ...(userId && { userId: parseInt(userId) }),
      },
      include: {
        user: true,
        item: true,
        purchasingGroup: true,
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

// POST /api/purchases
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId, purchasingGroupId, quantity, totalCents } = body;

    const purchase = await prisma.purchase.create({
      data: {
        userId,
        itemId,
        purchasingGroupId,
        quantity,
        totalCents,
      },
      include: {
        user: true,
        item: true,
        purchasingGroup: true,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}