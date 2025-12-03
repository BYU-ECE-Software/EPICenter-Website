// =============================================
// FILE: app/api/items/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/items
export async function GET(request: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      include: {
        purchases: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST /api/items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, priceCents, photoURL, description, location } = body;

    const item = await prisma.item.create({
      data: {
        name,
        priceCents,
        photoURL,
        description,
        location,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
