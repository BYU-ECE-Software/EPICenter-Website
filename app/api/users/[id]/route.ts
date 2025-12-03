// =============================================
// FILE: app/api/users/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Get a single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        orders: true,
        purchases: {
          include: {
            item: true,
            purchasingGroup: true,
          },
        },
        loans: {
          include: {
            equipment: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const body = await request.json();
    const { email, name, netID, byuID } = body;

    const user = await prisma.user.update({
      where: { id: parseInt((await params).id) },
      data: {
        email,
        name,
        netID,
        byuID,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    await prisma.user.delete({
      where: { id: parseInt((await params).id) },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}