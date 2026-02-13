// =============================================
// FILE: app/api/purchaseGroups/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function toInt(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

// GET /api/purchaseGroups?q=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const q = (sp.get("q") ?? "").trim();
    const page = toInt(sp.get("page"), 1);
    const limit = Math.min(toInt(sp.get("limit"), 20), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.PurchasingGroupWhereInput =
      q.length > 0
        ? {
            OR: [
              { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { workTag: { contains: q, mode: Prisma.QueryMode.insensitive } },
              {
                supervisor: { contains: q, mode: Prisma.QueryMode.insensitive },
              },
              { comments: { contains: q, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {};

    const [total, data] = await prisma.$transaction([
      prisma.purchasingGroup.count({ where }),
      prisma.purchasingGroup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      q,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch purchaseGroups" },
      { status: 500 },
    );
  }
}

// POST /api/purchaseGroups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, supervisor, workTag, comments } = body;

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (typeof workTag !== "string" || workTag.trim() === "") {
      return NextResponse.json(
        { error: "workTag is required" },
        { status: 400 },
      );
    }

    const purchasingGroup = await prisma.purchasingGroup.create({
      data: {
        name: name.trim(),
        supervisor: supervisor ?? null,
        workTag: workTag.trim(),
        comments: comments ?? null,
      },
    });

    return NextResponse.json(purchasingGroup, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create purchaseGroup" },
      { status: 500 },
    );
  }
}
