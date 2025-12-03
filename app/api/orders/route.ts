// =============================================
// FILE: app/api/orders/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders - List all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where: {
        ...(userId && { userId: parseInt(userId) }),
        ...(status && { status: status as any }),
      },
      include: {
        user: true,
        orderType: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, item, priceCents, orderTypeId, status } = body;

    const order = await prisma.order.create({
      data: {
        userId,
        item,
        priceCents,
        orderTypeId,
        status,
      },
      include: {
        user: true,
        orderType: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}