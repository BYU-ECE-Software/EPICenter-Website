// =============================================
// FILE: app/api/equipment/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/equipment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const equipment = await prisma.equipment.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      include: {
        loans: true,
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// POST /api/equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, serialNumber, location, pictureURL, status } = body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        serialNumber,
        location,
        pictureURL,
        status,
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}