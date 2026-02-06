// =============================================
// FILE: app/api/purchases/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(value: string | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

// GET /api/purchases?userId=123&purchasingGroupId=5
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = toInt(sp.get("userId"));
    const purchasingGroupId = toInt(sp.get("purchasingGroupId"));

    const purchases = await prisma.purchase.findMany({
      where: {
        ...(userId !== null && { userId }),
        ...(purchasingGroupId !== null && { purchasingGroupId }),
      },
      include: {
        user: true,
        items: true, // ✅ was item
        purchasingGroup: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(purchases);
  } catch {
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

// POST /api/purchases
// body: { userId?, purchasingGroupId?, quantity?, itemIds: number[], totalCents? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId = null,
      purchasingGroupId = null,
      itemIds,
      totalCents,
      receiptURL,
    } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "itemIds must be a non-empty array" }, { status: 400 });
    }

    // Optional: compute total if not provided (recommended to avoid trusting client)
    // const computedTotalCents =
    //   typeof totalCents === "number"
    //     ? totalCents
    //     : (await prisma.item.findMany({
    //         where: { id: { in: itemIds } },
    //         select: { priceCents: true },
    //       }))
    //         .reduce((sum, i) => sum + i.priceCents, 0) * Number(quantity || 1);

    const purchase = await prisma.purchase.create({
      data: {
        userId,
        purchasingGroupId,
        totalCents: totalCents,
        receiptURL,
        items: {
          connect: itemIds.map((id: number) => ({ id })), // ✅ connect many items
        },
      },
      include: {
        user: true,
        items: true,
        purchasingGroup: true,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
