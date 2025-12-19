import { NextResponse } from "next/server";
import { minioClient, ITEM_IMAGES_BUCKET } from "@/lib/minioClient";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key);
    const url = await minioClient.presignedGetObject(
      ITEM_IMAGES_BUCKET,
      key,
      60 * 10
    );
    return NextResponse.redirect(url, 302);
  } catch (err: any) {
    console.error("Get image failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Get image failed" },
      { status: 500 }
    );
  }
}
