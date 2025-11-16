import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const creditSchema = z.object({
  accountNumber: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  remark: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check admin authorization
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = creditSchema.parse(body)

    // Find the account
    const account = await prisma.account.findUnique({
      where: { accountNumber: data.accountNumber },
      include: {
        customer: true,
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Check if account is active
    if (account.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Cannot credit ${account.status} account` },
        { status: 400 }
      )
    }

    // Perform credit transaction
    const result = await prisma.$transaction(async (tx) => {
      const currentBalance = Number(account.balance)
      const creditAmount = data.amount
      const newBalance = currentBalance + creditAmount

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          type: "CREDIT",
          amount: creditAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: data.description,
          remark: data.remark,
          status: "COMPLETED",
        },
      })

      // Update account balance
      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balance: newBalance },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          adminId: session.user.adminId,
          action: "ADMIN_CREDIT",
          entity: "TRANSACTION",
          entityId: transaction.id,
          details: JSON.stringify({
            accountNumber: data.accountNumber,
            amount: creditAmount,
            description: data.description,
            customerNumber: account.customer.customerNumber,
            adminEmail: session.user.email,
          }),
        },
      })

      return { transaction, updatedAccount }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account credited successfully",
        transaction: {
          id: result.transaction.transactionId,
          amount: data.amount,
          newBalance: Number(result.updatedAccount.balance),
          timestamp: result.transaction.transactionDate,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Credit error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to credit account" },
      { status: 500 }
    )
  }
}
