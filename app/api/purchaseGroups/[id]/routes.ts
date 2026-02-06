// =============================================
// FILE: app/api/purchaseGroups/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseId(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /api/purchaseGroups/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const purchasingGroup = await prisma.purchasingGroup.findUnique({
      where: { id },
      include: { purchases: true },
    });

    if (!purchasingGroup) {
      return NextResponse.json({ error: "PurchasingGroup not found" }, { status: 404 });
    }

    return NextResponse.json(purchasingGroup);
  } catch {
    return NextResponse.json({ error: "Failed to fetch purchasingGroup" }, { status: 500 });
  }
}

// PUT /api/purchaseGroups/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    const { name, supervisor, workTag, comments } = body;

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (typeof workTag !== "string" || workTag.trim() === "") {
      return NextResponse.json({ error: "workTag is required" }, { status: 400 });
    }

    const purchasingGroup = await prisma.purchasingGroup.update({
      where: { id },
      data: {
        name: name.trim(),
        supervisor: supervisor ?? null,
        workTag: workTag.trim(),
        comments: comments ?? null,
      },
    });

    return NextResponse.json(purchasingGroup);
  } catch {
    return NextResponse.json({ error: "Failed to update purchasingGroup" }, { status: 500 });
  }
}

// DELETE /api/purchaseGroups/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.purchasingGroup.delete({ where: { id } });
    return NextResponse.json({ message: "PurchasingGroup deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete purchasingGroup" }, { status: 500 });
  }
}
