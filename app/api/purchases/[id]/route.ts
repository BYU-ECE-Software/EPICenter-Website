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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        user: true,
        items: true, // ✅ was item
        purchasingGroup: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}

// PUT /api/purchases/[id]
// supports updating: purchasingGroupId, items via itemIds, and optionally totalCents
// body: { purchasingGroupId?, itemIds?, totalCents? }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    const { purchasingGroupId, itemIds, totalCents } = body;

    // If itemIds provided, replace the set (simple & predictable)
    const itemsUpdate =
      Array.isArray(itemIds) && itemIds.every((x) => typeof x === "number")
        ? {
            items: {
              set: itemIds.map((itemId: number) => ({ id: itemId })),
            },
          }
        : {};

    // Optional: recompute total if not provided but itemIds changed
    let nextTotalCents: number | undefined = totalCents;

    if (typeof nextTotalCents !== "number" && Array.isArray(itemIds)) {
      const current = await prisma.purchase.findUnique({
        where: { id },
        include: { items: { select: { id: true, priceCents: true } } },
      });

      if (!current) {
        return NextResponse.json(
          { error: "Purchase not found" },
          { status: 404 }
        );
      }

      const ids = itemIds;
      const prices = await prisma.item.findMany({
        where: { id: { in: ids } },
        select: { priceCents: true },
      });

      // If you want to multiply by quantity later, re-enable your quantity code.
      nextTotalCents = prices.reduce((sum, i) => sum + i.priceCents, 0);
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        ...(typeof purchasingGroupId === "number" || purchasingGroupId === null
          ? { purchasingGroupId }
          : {}),
        ...(typeof nextTotalCents === "number"
          ? { totalCents: nextTotalCents }
          : {}),
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
      { status: 500 }
    );
  }
}

// DELETE /api/purchases/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.purchase.delete({ where: { id } });
    return NextResponse.json({ message: "Purchase deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete purchase" },
      { status: 500 }
    );
  }
}

//We may also investigate deleting receipts of purchases, tho I do think it will be few and far between; maybe some lib/util function we can create long term?

//This function could be useful in the future if we want to cut down on the awaiting in line
// async function getId(params: Promise<{ id: string }>) {
//   const { id } = await params;
//   return parseInt(id, 10);
// }