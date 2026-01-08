import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      select: { photoURL: true }, // only need the key
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (!item.photoURL) {
      return NextResponse.json({ error: "Item has no photo" }, { status: 404 });
    }

    const key = encodeURIComponent(item.photoURL);
    return NextResponse.redirect(
      new URL(`/api/minio/item-image/${key}`, _request.url),
      302
    );
  } catch (error: any) {
    console.error("Item photo GET failed:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch item photo" },
      { status: 500 }
    );
  }
}
