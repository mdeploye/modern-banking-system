import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const transferSchema = z.object({
  customerId: z.string(),
  fromAccountNumber: z.string(),
  toAccountNumber: z.string(),
  amount: z.number().positive(),
  description: z.string().default("Inter-account transfer"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = transferSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { customerId, fromAccountNumber, toAccountNumber, amount, description } = validation.data

    // Get admin record
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id },
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      )
    }

    // Verify both accounts belong to the same customer
    const accounts = await prisma.account.findMany({
      where: {
        customerId,
        accountNumber: {
          in: [fromAccountNumber, toAccountNumber],
        },
      },
    })

    if (accounts.length !== 2) {
      return NextResponse.json(
        { error: "Invalid accounts or accounts don't belong to the customer" },
        { status: 400 }
      )
    }

    const fromAccount = accounts.find((a) => a.accountNumber === fromAccountNumber)
    const toAccount = accounts.find((a) => a.accountNumber === toAccountNumber)

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: "One or both accounts not found" },
        { status: 404 }
      )
    }

    // Check if from account has sufficient balance
    if (Number(fromAccount.balance) < amount) {
      return NextResponse.json(
        { error: "Insufficient balance in source account" },
        { status: 400 }
      )
    }

    // Perform the transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const timestamp = new Date()

      // Debit from source account
      const debitTxn = await tx.transaction.create({
        data: {
          accountId: fromAccount.id,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          type: "DEBIT",
          amount,
          balanceBefore: fromAccount.balance,
          balanceAfter: Number(fromAccount.balance) - amount,
          description: `${description} to ${toAccountNumber}`,
          status: "COMPLETED",
          transactionDate: timestamp,
        },
      })

      // Credit to destination account
      const creditTxn = await tx.transaction.create({
        data: {
          accountId: toAccount.id,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          type: "CREDIT",
          amount,
          balanceBefore: toAccount.balance,
          balanceAfter: Number(toAccount.balance) + amount,
          description: `${description} from ${fromAccountNumber}`,
          status: "COMPLETED",
          transactionDate: timestamp,
        },
      })

      // Update account balances
      await tx.account.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: amount } },
      })

      await tx.account.update({
        where: { id: toAccount.id },
        data: { balance: { increment: amount } },
      })

      return { debitTxn, creditTxn }
    })

    // Log the admin action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "INTER_ACCOUNT_TRANSFER",
        entity: "ACCOUNT",
        entityId: fromAccount.id,
        customerId,
        details: `Transferred $${amount} from ${fromAccountNumber} to ${toAccountNumber}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    })

    return NextResponse.json({
      message: "Transfer successful",
      debitTransaction: result.debitTxn.transactionId,
      creditTransaction: result.creditTxn.transactionId,
    })
  } catch (error) {
    console.error("Error processing transfer:", error)
    return NextResponse.json(
      { error: "Failed to process transfer" },
      { status: 500 }
    )
  }
}
