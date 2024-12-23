import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all balances
export async function GET() {
  const balances = await prisma.balance.findMany({
    include: { user: true },
  });
  return NextResponse.json(balances);
}

// POST a new balance
export async function POST(req: Request) {
  const { amount, userId } = await req.json();
  const balance = await prisma.balance.create({
    data: { amount, userId },
  });
  return NextResponse.json(balance);
}

// DELETE a balance by ID
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const balance = await prisma.balance.delete({ where: { id } });
  return NextResponse.json(balance);
}

