// =============================================
// FILE: app/api/purchases/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/purchases/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        user: true,
        item: true,
        purchasingGroup: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchase' }, { status: 500 });
  }
}

// PUT /api/purchases/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const body = await request.json();
    const { quantity, totalCents, purchasingGroupId } = body;

    const purchase = await prisma.purchase.update({
      where: { id: parseInt((await params).id) },
      data: {
        quantity,
        totalCents,
        purchasingGroupId,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}

// DELETE /api/purchases/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    await prisma.purchase.delete({
      where: { id: parseInt((await params).id) },
    });

    return NextResponse.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}