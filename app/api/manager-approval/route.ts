import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const pin = (body?.pin ?? "").toString();

  const expected = process.env.MANAGER_APPROVAL_PIN ?? "";

  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "Manager approval is not configured." },
      { status: 500 },
    );
  }

  if (pin === expected) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, message: "Incorrect manager approval code." },
    { status: 401 },
  );
}
