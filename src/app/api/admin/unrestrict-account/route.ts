import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const unrestrictSchema = z.object({
  customerNumber: z.string().min(1),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
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
    const data = unrestrictSchema.parse(body)

    // Find the customer
    const customer = await prisma.customer.findUnique({
      where: { customerNumber: data.customerNumber },
      include: {
        user: {
          select: { email: true },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Check if actually restricted
    if (!customer.isRestricted) {
      return NextResponse.json(
        { error: "Customer account is not restricted" },
        { status: 400 }
      )
    }

    // Remove restriction
    const updatedCustomer = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id: customer.id },
        data: {
          isRestricted: false,
          restrictionType: null,
          restrictionReason: null,
          restrictedBy: null,
          restrictedAt: null,
          restrictionExpiry: null,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          adminId: session.user.adminId,
          customerId: customer.id,
          action: "ACCOUNT_UNRESTRICTED",
          entity: "CUSTOMER",
          entityId: customer.id,
          details: JSON.stringify({
            customerNumber: data.customerNumber,
            customerEmail: customer.user.email,
            previousRestrictionType: customer.restrictionType,
            unrestrictReason: data.reason,
            adminEmail: session.user.email,
          }),
        },
      })

      return updated
    })

    return NextResponse.json(
      {
        success: true,
        message: "Customer account restriction removed successfully",
        customer: {
          customerNumber: data.customerNumber,
          email: customer.user.email,
          unrestrictedAt: new Date(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unrestrict error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to remove restriction" },
      { status: 500 }
    )
  }
}
