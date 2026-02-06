// =============================================
// FILE: app/api/orders/pcb/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/pcb/:id
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);

    const order = await prisma.pCB_Order.findUnique({
      where: { id },
      include: { user: true, purchasingGroup: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch PCB order" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/pcb/:id
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    const body = await request.json();

    const updated = await prisma.pCB_Order.update({
      where: { id },
      data: {
        ...body,
        ...(body.additionalComments !== undefined && {
          additionalComments: body.additionalComments ?? null,
        }),
        ...(body.technicianComments !== undefined && {
          technicianComments: body.technicianComments ?? null,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update PCB order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/pcb/:id
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
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

    const updated = await prisma.pCB_Order.update({
      where: { id },
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
        status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to replace PCB order" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/pcb/:id
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);

    await prisma.pCB_Order.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete PCB order" },
      { status: 500 }
    );
  }
}
