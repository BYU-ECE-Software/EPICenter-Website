import { NextResponse } from 'next/server'


export async function GET() {
    return NextResponse.json("ok", { status: 200, headers: { "Content-Type": "text/plain" } })
}