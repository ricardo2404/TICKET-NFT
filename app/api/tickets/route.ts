import { NextResponse } from "next/server";

let tickets: string[] = [];

export async function GET() {
  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  const body = await req.json();
  tickets.push(body.ticket);
  return NextResponse.json({ success: true });
}