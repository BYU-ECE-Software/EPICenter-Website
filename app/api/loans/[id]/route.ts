// =============================================
// FILE: app/api/loans/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/loans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        user: true,
        equipment: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 });
  }
}

// PUT /api/loans/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const body = await request.json();
    const { returnDate, status } = body;

    const loan = await prisma.loan.update({
      where: { id: parseInt((await params).id) },
      data: {
        returnDate,
        status,
      },
      include: {
        equipment: true,
      },
    });

    // If loan is returned, update equipment status
    if (status === 'RETURNED') {
      await prisma.equipment.update({
        where: { id: loan.equipmentId },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json(loan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
  }
}

// DELETE /api/loans/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string}> }
) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: parseInt((await params).id) },
    });

    if (loan) {
      await prisma.equipment.update({
        where: { id: loan.equipmentId },
        data: { status: 'AVAILABLE' },
      });
    }

    await prisma.loan.delete({
      where: { id: parseInt((await params).id) },
    });

    return NextResponse.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 });
  }
}