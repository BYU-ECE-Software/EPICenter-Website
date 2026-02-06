// =============================================
// FILE: app/api/orders/3dprint/[id]/route.ts
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/3dprint/:id
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);

    const order = await prisma.print_3D_Order.findUnique({
      where: { id },
      include: { user: true, purchasingGroup: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch 3D print order" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/3dprint/:id (partial update)
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    const body = await request.json();

    const updated = await prisma.print_3D_Order.update({
      where: { id },
      data: {
        ...body,
        // optionally normalize nullables:
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
      { error: "Failed to update 3D print order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/3dprint/:id
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
      filamentColor,
      quantity,
      status,
    } = body;

    const updated = await prisma.print_3D_Order.update({
      where: { id },
      data: {
        userId: userId ?? null,
        groupId: groupId ?? null,
        studentName,
        studentEmail,
        modelFileURL,
        additionalComments: additionalComments ?? null,
        technicianComments: technicianComments ?? null,
        filamentColor,
        quantity,
        status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to replace 3D print order" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/3dprint/:id
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);

    await prisma.print_3D_Order.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete 3D print order" },
      { status: 500 }
    );
  }
}
