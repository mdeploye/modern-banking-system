import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const customerId = session.user.customerId

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID not found" },
        { status: 400 }
      )
    }

    // Get ALL customer's accounts (checking and savings)
    const accounts = await prisma.account.findMany({
      where: {
        customerId,
      },
    })

    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: "Accounts not found" },
        { status: 404 }
      )
    }

    // Get account IDs
    const accountIds = accounts.map(acc => acc.id)

    // Get transactions from ALL accounts
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: {
          in: accountIds
        },
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
          }
        }
      },
      orderBy: {
        transactionDate: "desc",
      },
      take: 100,
    })

    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      transactionId: txn.transactionId,
      type: txn.type,
      amount: txn.amount.toString(),
      balanceBefore: txn.balanceBefore.toString(),
      balanceAfter: txn.balanceAfter.toString(),
      description: txn.description,
      status: txn.status,
      accountNumber: txn.account.accountNumber,
      accountType: txn.account.accountType,
      senderAccountNumber: null,
      recipientAccountNumber: txn.receiverAccount || null,
      date: txn.transactionDate,
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
