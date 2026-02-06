// =============================================
// FILE: app/api/purchases/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /api/purchases/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }, // ✅ not a Promise
) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        user: true,
        items: true, // ✅ was item
        purchasingGroup: true,
        receiptURL: true
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(purchase);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 },
    );
  }
}

// PUT /api/purchases/[id]
// supports updating: quantity, purchasingGroupId, and items via itemIds
// body: { quantity?, purchasingGroupId?, itemIds?, totalCents? }
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    const { purchasingGroupId, itemIds, totalCents } = body;

    // If itemIds provided, replace the set (simple & predictable)
    // Alternative: support connect/disconnect arrays; see note below.
    const itemsUpdate = Array.isArray(itemIds)
      ? {
          items: {
            set: itemIds.map((itemId: number) => ({ id: itemId })), // ✅ replace line items
          },
        }
      : {};

    // Optional: recompute total if not provided but itemIds/quantity changed
    let nextTotalCents = totalCents;
    if (
      typeof nextTotalCents !== "number" &&
      (Array.isArray(itemIds) )
    ) {
      const current = await prisma.purchase.findUnique({
        where: { id },
        include: { items: { select: { id: true, priceCents: true } } },
      });
      if (!current)
        return NextResponse.json(
          { error: "Purchase not found" },
          { status: 404 },
        );

      const ids = Array.isArray(itemIds)
        ? itemIds
        : current.items.map((i) => i.id);
      const prices = await prisma.item.findMany({
        where: { id: { in: ids } },
        select: { priceCents: true },
      });

      // const q = typeof quantity === "number" ? quantity : current.quantity;
      // nextTotalCents = prices.reduce((sum, i) => sum + i.priceCents, 0) * q;
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        // ...(typeof quantity === "number" && { quantity }),
        ...(typeof purchasingGroupId === "number" || purchasingGroupId === null
          ? { purchasingGroupId }
          : {}),
        ...(typeof nextTotalCents === "number" && {
          totalCents: nextTotalCents,
        }),
        ...itemsUpdate,
      },
      include: {
        user: true,
        items: true,
        purchasingGroup: true,
      },
    });

    return NextResponse.json(purchase);
  } catch {
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 },
    );
  }
}

// DELETE /api/purchases/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.purchase.delete({ where: { id } });
    return NextResponse.json({ message: "Purchase deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete purchase" },
      { status: 500 },
    );
  }
}

//We may also investigate deleting receipts of purchases, tho I do think it will be few and far between; maybe some lib/util function we can create long term?
