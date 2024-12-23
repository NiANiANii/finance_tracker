import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all transactions
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: { user: true },
  });
  return NextResponse.json(transactions);
}

// POST a new transaction
export async function POST(req: Request) {
  const { type, amount, userId, description, categoryId } = await req.json();

  try {
    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        // Menghubungkan transaksi dengan pengguna berdasarkan userId
        user: {
          connect: { id: userId }, // Connect ke user berdasarkan userId
        },
        // Jika ada kategori, Anda bisa menambahkannya di sini juga
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

// PUT to update a transaction
export async function PUT(req: Request) {
  const { id, type, amount, userId, description, categoryId } = await req.json();

  // Validate `id`
  if (!id) {
    return NextResponse.json(
      { error: "Transaction ID is required" },
      { status: 400 }
    );
  }

  try {
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        description,
        user: userId ? { connect: { id: userId } } : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
    });
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE a transaction by ID
export async function DELETE(req: Request) {
  const { id } = await req.json();

  // Validate `id`
  if (!id) {
    return NextResponse.json(
      { error: "Transaction ID is required" },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.transaction.delete({
      where: { id },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}



