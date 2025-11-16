import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Transaction approval threshold ($500 or more requires admin approval)
const APPROVAL_THRESHOLD = 500

const transferSchema = z.object({
  toAccountNumber: z.string().min(1, "Account number is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = transferSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      )
    }

    const { toAccountNumber, amount, description } = validation.data

    // Get sender's account
    const senderAccount = await prisma.account.findFirst({
      where: {
        customer: {
          userId: session.user.id,
        },
        status: "ACTIVE",
      },
      include: {
        customer: true,
      },
    })

    if (!senderAccount) {
      return NextResponse.json(
        { error: "Sender account not found or not active" },
        { status: 404 }
      )
    }

    // Check if account is restricted
    if (senderAccount.customer.isRestricted) {
      return NextResponse.json(
        {
          error: "Account is restricted",
          restrictionType: senderAccount.customer.restrictionType,
          restrictionReason: senderAccount.customer.restrictionReason,
        },
        { status: 403 }
      )
    }

    // Check sufficient balance
    const senderBalance = parseFloat(senderAccount.balance.toString())
    if (senderBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Get receiver's account
    const receiverAccount = await prisma.account.findUnique({
      where: {
        accountNumber: toAccountNumber,
        status: "ACTIVE",
      },
      include: {
        customer: true,
      },
    })

    if (!receiverAccount) {
      return NextResponse.json(
        { error: "Recipient account not found or not active" },
        { status: 404 }
      )
    }

    // Can't transfer to self
    if (senderAccount.id === receiverAccount.id) {
      return NextResponse.json(
        { error: "Cannot transfer to your own account" },
        { status: 400 }
      )
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Check if approval is needed
    const needsApproval = amount >= APPROVAL_THRESHOLD

    if (needsApproval) {
      // Create pending transaction (balances not updated yet)
      const receiverBalance = parseFloat(receiverAccount.balance.toString())
      
      await prisma.transaction.create({
        data: {
          accountId: senderAccount.id,
          transactionId,
          type: "TRANSFER",
          amount: -amount,
          balanceBefore: senderBalance,
          balanceAfter: senderBalance, // Balance unchanged until approved
          description: `Transfer to ${receiverAccount.accountNumber} - ${description} [PENDING APPROVAL]`,
          status: "PENDING_APPROVAL",
          receiverId: receiverAccount.customerId,
          receiverAccount: receiverAccount.accountNumber,
          remark: `Awaiting admin approval (Amount: $${amount} >= $${APPROVAL_THRESHOLD})`,
        },
      })

      return NextResponse.json({
        message: "Transfer pending admin approval",
        needsApproval: true,
        transaction: {
          transactionId,
          amount,
          from: senderAccount.accountNumber,
          to: receiverAccount.accountNumber,
          recipientName: `${receiverAccount.customer.firstName} ${receiverAccount.customer.lastName}`,
          status: "PENDING_APPROVAL",
          description,
        },
      })
    }

    // Instant transfer (amount < threshold)
    const result = await prisma.$transaction(async (tx) => {
      // Debit sender
      const newSenderBalance = senderBalance - amount
      await tx.account.update({
        where: { id: senderAccount.id },
        data: { balance: newSenderBalance },
      })

      // Credit receiver
      const receiverBalance = parseFloat(receiverAccount.balance.toString())
      const newReceiverBalance = receiverBalance + amount
      await tx.account.update({
        where: { id: receiverAccount.id },
        data: { balance: newReceiverBalance },
      })

      // Create sender transaction (debit)
      const senderTxn = await tx.transaction.create({
        data: {
          accountId: senderAccount.id,
          transactionId,
          type: "TRANSFER",
          amount: -amount, // Negative for debit
          balanceBefore: senderBalance,
          balanceAfter: newSenderBalance,
          description: `Transfer to ${receiverAccount.accountNumber} - ${description}`,
          status: "COMPLETED",
          receiverId: receiverAccount.customerId,
          receiverAccount: receiverAccount.accountNumber,
        },
      })

      // Create receiver transaction (credit)
      await tx.transaction.create({
        data: {
          accountId: receiverAccount.id,
          transactionId: `${transactionId}-IN`,
          type: "TRANSFER",
          amount, // Positive for credit
          balanceBefore: receiverBalance,
          balanceAfter: newReceiverBalance,
          description: `Transfer from ${senderAccount.accountNumber} - ${description}`,
          status: "COMPLETED",
          senderId: senderAccount.customerId,
        },
      })

      return { senderTxn, newSenderBalance, newReceiverBalance }
    })

    return NextResponse.json({
      message: "Transfer successful",
      needsApproval: false,
      transaction: {
        transactionId,
        amount,
        from: senderAccount.accountNumber,
        to: receiverAccount.accountNumber,
        recipientName: `${receiverAccount.customer.firstName} ${receiverAccount.customer.lastName}`,
        newBalance: result.newSenderBalance,
        status: "COMPLETED",
        description,
      },
    })
  } catch (error: any) {
    console.error("Transfer error:", error)
    return NextResponse.json(
      { error: "Transfer failed", message: error.message },
      { status: 500 }
    )
  }
}
