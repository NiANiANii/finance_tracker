import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all expenses
export async function GET() {
  const expenses = await prisma.expense.findMany({
    include: { user: true, category: true },
  });
  return NextResponse.json(expenses);
}

// POST a new expense
export async function POST(req: Request) {
  const { description, amount, userId, categoryId } = await req.json();
  const expense = await prisma.expense.create({
    data: { description, amount, userId, categoryId },
  });
  return NextResponse.json(expense);
}

// DELETE an expense by ID
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const expense = await prisma.expense.delete({ where: { id } });
  return NextResponse.json(expense);
}

