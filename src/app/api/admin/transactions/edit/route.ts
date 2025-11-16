import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const editTransactionSchema = z.object({
  transactionId: z.string(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = editTransactionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { transactionId, description, amount, status } = validation.data

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

    // Get the transaction with account info
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      include: { account: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (description !== undefined) {
      updateData.description = description
    }

    if (status !== undefined) {
      updateData.status = status
    }

    // If amount is being changed, we need to recalculate balances
    if (amount !== undefined && amount !== Number(transaction.amount)) {
      const oldAmount = Number(transaction.amount)
      const difference = amount - oldAmount
      
      // Update balances
      if (transaction.type === "DEBIT") {
        updateData.amount = amount
        updateData.balanceAfter = Number(transaction.balanceAfter) - difference
        
        // Update account balance
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              decrement: difference,
            },
          },
        })
      } else if (transaction.type === "CREDIT") {
        updateData.amount = amount
        updateData.balanceAfter = Number(transaction.balanceAfter) + difference
        
        // Update account balance
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: difference,
            },
          },
        })
      }
    }

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { transactionId },
      data: updateData,
    })

    // Log the admin action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "EDIT_TRANSACTION",
        entity: "TRANSACTION",
        entityId: transaction.id,
        details: `Edited transaction ${transactionId}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    })

    return NextResponse.json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    })
  } catch (error) {
    console.error("Error editing transaction:", error)
    return NextResponse.json(
      { error: "Failed to edit transaction" },
      { status: 500 }
    )
  }
}
