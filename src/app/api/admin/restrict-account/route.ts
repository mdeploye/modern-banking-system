import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const restrictSchema = z.object({
  customerNumber: z.string().min(1),
  restrictionType: z.enum([
    "WITHDRAWAL_LIMIT",
    "TRANSFER_BLOCKED",
    "FROZEN",
    "PENDING_VERIFICATION",
    "SUSPICIOUS_ACTIVITY",
  ]),
  restrictionReason: z.string().min(10, "Reason must be at least 10 characters"),
  expiryDate: z.string().optional(),
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
    const data = restrictSchema.parse(body)

    // Find the customer
    const customer = await prisma.customer.findUnique({
      where: { customerNumber: data.customerNumber },
      include: {
        user: {
          select: { email: true },
        },
        accounts: {
          select: { accountNumber: true, status: true },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Check if already restricted
    if (customer.isRestricted) {
      return NextResponse.json(
        { 
          error: "Customer already has restrictions",
          currentRestriction: {
            type: customer.restrictionType,
            reason: customer.restrictionReason,
            appliedAt: customer.restrictedAt,
          }
        },
        { status: 400 }
      )
    }

    // Apply restriction
    const updatedCustomer = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id: customer.id },
        data: {
          isRestricted: true,
          restrictionType: data.restrictionType,
          restrictionReason: data.restrictionReason,
          restrictedBy: session.user.adminId,
          restrictedAt: new Date(),
          restrictionExpiry: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          adminId: session.user.adminId,
          customerId: customer.id,
          action: "ACCOUNT_RESTRICTED",
          entity: "CUSTOMER",
          entityId: customer.id,
          details: JSON.stringify({
            customerNumber: data.customerNumber,
            customerEmail: customer.user.email,
            restrictionType: data.restrictionType,
            restrictionReason: data.restrictionReason,
            expiryDate: data.expiryDate,
            adminEmail: session.user.email,
            accounts: customer.accounts.map(a => a.accountNumber),
          }),
        },
      })

      return updated
    })

    return NextResponse.json(
      {
        success: true,
        message: "Customer account restricted successfully",
        restriction: {
          customerNumber: data.customerNumber,
          type: data.restrictionType,
          reason: data.restrictionReason,
          appliedAt: updatedCustomer.restrictedAt,
          expiresAt: updatedCustomer.restrictionExpiry,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Restriction error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to restrict account" },
      { status: 500 }
    )
  }
}
