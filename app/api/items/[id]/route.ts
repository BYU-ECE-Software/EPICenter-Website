// =============================================
// FILE: app/api/items/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        purchases: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

// PUT /api/items/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const body = await request.json();
    const { name, priceCents, photoURL, description, location } = body;

    const item = await prisma.item.update({
      where: { id: parseInt((await params).id) },
      data: {
        name,
        priceCents,
        photoURL,
        description,
        location,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/items/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    await prisma.item.delete({
      where: { id: parseInt((await params).id) },
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}