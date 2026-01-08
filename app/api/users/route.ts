
// =============================================
// FILE: app/api/users/route.ts
// =============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true,
        purchases: true,
        loans: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, netID, byuID } = body;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        netID,
        byuID,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}