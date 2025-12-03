// =============================================
// FILE: app/api/equipment/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/equipment/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        loans: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// PUT /api/equipment/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const body = await request.json();
    const { name, serialNumber, location, pictureURL, status } = body;

    const equipment = await prisma.equipment.update({
      where: { id: parseInt((await params).id) },
      data: {
        name,
        serialNumber,
        location,
        pictureURL,
        status,
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

// DELETE /api/equipment/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    await prisma.equipment.delete({
      where: { id: parseInt((await params).id) },
    });

    return NextResponse.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}