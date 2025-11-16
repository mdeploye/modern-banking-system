import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const transactions = await prisma.transaction.findMany({
      include: {
        account: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        transactionDate: "desc",
      },
      take: limit,
    })

    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      transactionId: txn.transactionId,
      accountNumber: txn.account!.accountNumber,
      customerName: `${txn.account!.customer.firstName} ${txn.account!.customer.lastName}`,
      type: txn.type,
      amount: txn.amount.toString(),
      description: txn.description,
      status: txn.status,
      createdAt: txn.transactionDate,
    }))

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error: any) {
    console.error("Fetch transactions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
