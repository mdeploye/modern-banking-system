import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get admin details for audit logging
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.adminId! }
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      )
    }

    const { transactionId, action, reason } = await request.json()

    if (!transactionId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get transaction with account details
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      include: {
        account: {
          include: { customer: true }
        }
      }
    })

    if (!transaction || transaction.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: "Invalid transaction or already processed" },
        { status: 400 }
      )
    }

    if (action === "APPROVE") {
      // Process the transfer
      await prisma.$transaction(async (tx) => {
        const senderAccount = transaction.account
        const amount = Math.abs(parseFloat(transaction.amount.toString()))
        
        // Get receiver account
        const receiverAccount = await tx.account.findUnique({
          where: { accountNumber: transaction.receiverAccount! },
          include: { customer: true }
        })
        
        if (!receiverAccount) {
          throw new Error("Receiver account not found")
        }
        
        // Check sender still has sufficient balance
        const currentSenderBalance = parseFloat(senderAccount.balance.toString())
        if (currentSenderBalance < amount) {
          throw new Error("Insufficient balance in sender account")
        }
        
        // Update balances
        const newSenderBalance = currentSenderBalance - amount
        const currentReceiverBalance = parseFloat(receiverAccount.balance.toString())
        const newReceiverBalance = currentReceiverBalance + amount
        
        await tx.account.update({
          where: { id: senderAccount.id },
          data: { balance: newSenderBalance }
        })
        
        await tx.account.update({
          where: { id: receiverAccount.id },
          data: { balance: newReceiverBalance }
        })
        
        // Update sender transaction
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "COMPLETED",
            balanceAfter: newSenderBalance,
            description: transaction.description.replace('[PENDING APPROVAL]', '[APPROVED]'),
            remark: `Approved by admin on ${new Date().toISOString()}`
          }
        })
        
        // Create receiver transaction
        await tx.transaction.create({
          data: {
            accountId: receiverAccount.id,
            transactionId: `${transactionId}-IN`,
            type: "TRANSFER",
            amount,
            balanceBefore: currentReceiverBalance,
            balanceAfter: newReceiverBalance,
            description: `Transfer from ${senderAccount.accountNumber} (Admin Approved)`,
            status: "COMPLETED",
            senderId: senderAccount.customerId,
          }
        })
        
        // Create audit log
        await tx.auditLog.create({
          data: {
            adminId: session.user.adminId!,
            customerId: senderAccount.customerId,
            action: "TRANSACTION_APPROVED",
            entity: "TRANSACTION",
            entityId: transaction.id,
            details: JSON.stringify({
              transactionId,
              amount,
              from: senderAccount.accountNumber,
              to: receiverAccount.accountNumber,
              approvedBy: `${admin.firstName} ${admin.lastName}`
            }),
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          }
        })
      })
      
      return NextResponse.json({ 
        message: "Transaction approved successfully",
        transactionId 
      })
      
    } else if (action === "REJECT") {
      // Reject transaction
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "REJECTED",
            remark: reason || `Rejected by admin on ${new Date().toISOString()}`,
          }
        })
        
        // Create audit log
        await tx.auditLog.create({
          data: {
            adminId: session.user.adminId!,
            customerId: transaction.account.customerId,
            action: "TRANSACTION_REJECTED",
            entity: "TRANSACTION",
            entityId: transaction.id,
            details: JSON.stringify({
              transactionId,
              amount: Math.abs(parseFloat(transaction.amount.toString())),
              reason: reason || "No reason provided",
              rejectedBy: `${admin.firstName} ${admin.lastName}`
            }),
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          }
        })
      })
      
      return NextResponse.json({ 
        message: "Transaction rejected",
        transactionId 
      })
      
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use APPROVE or REJECT" },
        { status: 400 }
      )
    }
    
  } catch (error: any) {
    console.error("Approve transaction error:", error)
    return NextResponse.json(
      { error: "Failed to process transaction", message: error.message },
      { status: 500 }
    )
  }
}
