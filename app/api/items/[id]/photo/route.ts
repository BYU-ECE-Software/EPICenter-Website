import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { minioClient, ITEM_IMAGES_BUCKET } from "@/lib/minioClient";
import { Readable } from "node:stream";

export const runtime = "nodejs";

// Helper to turn a MinIO stream into raw bytes to be sent to the browser
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// Load an item’s image from MinIO and return it directly to the browser
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Look up the stored MinIO object key for this item
    const item = await prisma.item.findUnique({
      where: { id },
      select: { photoURL: true },
    });

    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (!item.photoURL)
      return NextResponse.json({ error: "Item has no photo" }, { status: 404 });

    const key = item.photoURL;

    // Get the real Content-Type stored in MinIO for this object
    const stat = await minioClient.statObject(ITEM_IMAGES_BUCKET, key);

    const contentType =
      stat.metaData?.["content-type"] ??
      stat.metaData?.["Content-Type"] ??
      "application/octet-stream";

    // Fetch the image file from MinIO using the stored key
    const objStream = await minioClient.getObject(ITEM_IMAGES_BUCKET, key);

    // Convert the stream into bytes the browser can render
    const buffer = await streamToBuffer(objStream as unknown as Readable);

    // Send the image bytes back as an HTTP response
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Item photo GET failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch item photo" },
      { status: 500 }
    );
  }
}
