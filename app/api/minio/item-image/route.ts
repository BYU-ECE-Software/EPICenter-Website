import { NextResponse } from "next/server";
import { minioClient, ITEM_IMAGES_BUCKET } from "@/lib/minioClient";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; // important: MinIO SDK uses Node APIs

function extFromFilename(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

// reads photo from FormData
// generates a random key
// uploads the bytes to MinIO
// store that key in Item.photoURL

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("photo");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing photo (field name must be 'photo')" },
        { status: 400 }
      );
    }

    // optional: basic file type guard
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = extFromFilename(file.name);
    const objectName = `${randomUUID()}${ext}`; // store this in Item.photoURL

    await minioClient.putObject(
      ITEM_IMAGES_BUCKET,
      objectName,
      buffer,
      buffer.length,
      {
        "Content-Type": file.type,
      }
    );

    return NextResponse.json({ key: objectName }, { status: 201 });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
