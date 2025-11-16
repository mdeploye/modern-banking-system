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

    const pending = await prisma.transaction.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: {
        account: {
          include: { customer: true }
        }
      },
      orderBy: { transactionDate: 'desc' }
    })

    const formatted = pending.map(txn => ({
      id: txn.id,
      transactionId: txn.transactionId,
      customerName: `${txn.account.customer.firstName} ${txn.account.customer.lastName}`,
      accountNumber: txn.account.accountNumber,
      amount: Math.abs(parseFloat(txn.amount.toString())),
      recipientAccount: txn.receiverAccount,
      description: txn.description,
      remark: txn.remark,
      date: txn.transactionDate,
    }))

    return NextResponse.json({ transactions: formatted })
  } catch (error) {
    console.error("Fetch pending transactions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending transactions" },
      { status: 500 }
    )
  }
}
