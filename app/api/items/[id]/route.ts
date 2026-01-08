// =============================================
// FILE: app/api/items/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { minioClient, ITEM_IMAGES_BUCKET } from "@/lib/minioClient";

export const runtime = "nodejs";

// GET /api/items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        purchases: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);

    const body = await request.json();
    const { name, priceCents, photoURL, description, location } = body;

    // 1) Grab the existing photo key before updating
    const existing = await prisma.item.findUnique({
      where: { id },
      select: { photoURL: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const oldKey = existing.photoURL ?? null;

    // 2) Update the item (normalize photoURL to null if missing)
    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        priceCents,
        photoURL: photoURL ?? null,
        description,
        location,
      },
    });

    const newKey = item.photoURL ?? null;

    // 3) If the photo changed OR was removed, delete the old object from MinIO
    if (oldKey && oldKey !== newKey) {
      try {
        await minioClient.removeObject(ITEM_IMAGES_BUCKET, oldKey);
      } catch (err) {
        // Best-effort cleanup: do not fail the update if MinIO delete fails
        console.warn("MinIO old image cleanup failed:", err);
      }
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);

    // 1) Find the item first so we can grab the MinIO key
    const existing = await prisma.item.findUnique({
      where: { id },
      select: { photoURL: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 2) Delete the DB row
    await prisma.item.delete({
      where: { id },
    });

    // 3) Best-effort delete the MinIO object (if there is one)
    if (existing.photoURL) {
      try {
        await minioClient.removeObject(ITEM_IMAGES_BUCKET, existing.photoURL);
      } catch (err) {
        // don't fail the whole deletion if MinIO cleanup fails
        console.warn("MinIO image delete failed:", err);
      }
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
