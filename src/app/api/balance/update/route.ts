import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  return NextResponse.json({ message: "This endpoint supports POST requests for updating balance." });
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const updatedBalance = await prisma.balance.update({
      where: { id: 1 }, // Sesuaikan dengan ID pengguna atau kondisi lain
      data: {
        amount: { increment: amount },
      },
    });

    return NextResponse.json(updatedBalance);
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      { error: "Failed to update balance" },
      { status: 500 }
    );
  }
}


