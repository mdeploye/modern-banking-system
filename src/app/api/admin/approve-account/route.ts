import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const approveSchema = z.object({
  accountId: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = approveSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      )
    }

    const { accountId, action, reason } = validation.data

    // Get account details
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        customer: {
          include: {
            user: true
          }
        }
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    if (account.status !== "PENDING") {
      return NextResponse.json(
        { error: "Account is not pending approval" },
        { status: 400 }
      )
    }

    if (action === "APPROVE") {
      // Approve account
      await prisma.account.update({
        where: { id: accountId },
        data: {
          status: "ACTIVE",
          approvedBy: session.user.adminId,
          approvedAt: new Date(),
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.user.adminId!,
          customerId: account.customerId,
          action: "ACCOUNT_APPROVED",
          details: `Account ${account.accountNumber} approved`,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      })

      return NextResponse.json({
        message: "Account approved successfully",
        account: {
          accountNumber: account.accountNumber,
          customerName: `${account.customer.firstName} ${account.customer.lastName}`,
        },
      })
    } else {
      // Reject account - mark as closed
      await prisma.account.update({
        where: { id: accountId },
        data: {
          status: "CLOSED",
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.user.adminId!,
          customerId: account.customerId,
          action: "ACCOUNT_REJECTED",
          details: `Account ${account.accountNumber} rejected. Reason: ${reason || "No reason provided"}`,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      })

      return NextResponse.json({
        message: "Account rejected",
        account: {
          accountNumber: account.accountNumber,
          customerName: `${account.customer.firstName} ${account.customer.lastName}`,
        },
      })
    }
  } catch (error: any) {
    console.error("Approve account error:", error)
    return NextResponse.json(
      { error: "Failed to process account", message: error.message },
      { status: 500 }
    )
  }
}
