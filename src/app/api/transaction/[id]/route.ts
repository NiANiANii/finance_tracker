import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Handle PUT request to update a specific transaction
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Ambil parameter ID dari URL
  const { description, amount, type, userId, categoryId } = await req.json();

  // Validasi ID
  const transactionId = parseInt(id);
  if (isNaN(transactionId)) {
    return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
  }

  try {
    // Ambil transaksi lama untuk perhitungan selisih saldo
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Hitung perubahan saldo berdasarkan selisih transaksi lama dan baru
    const oldAmount = existingTransaction.amount * (existingTransaction.type === "income" ? 1 : -1);
    const newAmount = amount * (type === "income" ? 1 : -1);
    const balanceDifference = newAmount - oldAmount;

    // Update transaksi
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { description, amount, type, userId, categoryId },
    });

    // Perbarui saldo
    await prisma.balance.update({
      where: { userId: userId || existingTransaction.userId },
      data: {
        amount: { increment: balanceDifference },
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

// Handle DELETE request to remove a specific transaction
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Ambil parameter ID dari URL

  const transactionId = parseInt(id);
  if (isNaN(transactionId)) {
    return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
  }

  try {
    // Ambil transaksi lama untuk menghitung pengaruhnya terhadap saldo
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const amountChange = existingTransaction.amount * (existingTransaction.type === "income" ? -1 : 1);

    // Hapus transaksi
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    // Perbarui saldo
    await prisma.balance.update({
      where: { userId: existingTransaction.userId },
      data: {
        amount: { increment: amountChange },
      },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}



