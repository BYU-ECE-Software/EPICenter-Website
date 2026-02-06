// =============================================
// FILE: app/api/orders/pcb/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/pcb
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const userId = searchParams.get("userId");
    const groupId = searchParams.get("groupId");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const orders = await prisma.pCB_Order.findMany({
      where: {
        ...(userId && { userId: parseInt(userId, 10) }),
        ...(groupId && { groupId: parseInt(groupId, 10) }),
        ...(status && { status: status as any }),
        ...(q && {
          OR: [
            { studentName: { contains: q, mode: "insensitive" } },
            { studentEmail: { contains: q, mode: "insensitive" } },
            { additionalComments: { contains: q, mode: "insensitive" } },
            { technicianComments: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        user: true,
        purchasingGroup: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch PCB orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders/pcb
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      groupId,
      studentName,
      studentEmail,
      modelFileURL,
      additionalComments,
      technicianComments,
      PCBSiding,
      quantity,
      silkscreen,
      boardArea,
      rubout,
      costEstimateCents,
      status,
    } = body;

    // Required fields (based on your model: PCB has a bunch required)
    if (
      !studentName ||
      !studentEmail ||
      !modelFileURL ||
      PCBSiding === undefined ||
      quantity === undefined ||
      silkscreen === undefined ||
      boardArea === undefined ||
      rubout === undefined ||
      costEstimateCents === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const created = await prisma.pCB_Order.create({
      data: {
        userId: userId ?? null,
        groupId: groupId ?? null,
        studentName,
        studentEmail,
        modelFileURL,
        additionalComments: additionalComments ?? null,
        technicianComments: technicianComments ?? null,
        PCBSiding,
        quantity,
        silkscreen,
        boardArea,
        rubout,
        costEstimateCents,
        ...(status && { status }),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create PCB order" },
      { status: 500 }
    );
  }
}
