import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const restrictSchema = z.object({
  customerId: z.string(),
  action: z.enum(["RESTRICT", "UNRESTRICT"]),
  reason: z.string().min(1, "Reason is required"),
  restrictionType: z.enum(["FROZEN", "TRANSFER_BLOCKED", "WITHDRAWAL_LIMIT", "PENDING_VERIFICATION", "SUSPICIOUS_ACTIVITY"]).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = restrictSchema.parse(body)

    // Get admin
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Check permission
    if (!admin.canRestrictAccounts) {
      return NextResponse.json(
        { error: "You don't have permission to restrict accounts" },
        { status: 403 }
      )
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      include: {
        accounts: true,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    const newStatus = data.action === "RESTRICT" ? "SUSPENDED" : "ACTIVE"

    // Update customer restriction status
    await prisma.customer.update({
      where: { id: data.customerId },
      data: {
        isRestricted: data.action === "RESTRICT",
        restrictionType: data.action === "RESTRICT" ? (data.restrictionType || "FROZEN") : null,
        restrictionReason: data.action === "RESTRICT" ? data.reason : null,
        restrictedBy: data.action === "RESTRICT" ? admin.id : null,
        restrictedAt: data.action === "RESTRICT" ? new Date() : null,
      },
    })

    // Update all customer accounts
    await prisma.account.updateMany({
      where: { customerId: data.customerId },
      data: { status: newStatus },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        customerId: data.customerId,
        action: data.action === "RESTRICT" ? "ACCOUNT_RESTRICTED" : "ACCOUNT_UNRESTRICTED",
        entity: "CUSTOMER",
        entityId: data.customerId,
        details: JSON.stringify({
          customerNumber: customer.customerNumber,
          accountsAffected: customer.accounts.length,
          reason: data.reason || "No reason provided",
        }),
      },
    })

    return NextResponse.json({
      message: `Customer ${data.action === "RESTRICT" ? "restricted" : "unrestricted"} successfully`,
      status: newStatus,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error restricting customer:", error)
    return NextResponse.json(
      { error: "Failed to update restriction" },
      { status: 500 }
    )
  }
}
