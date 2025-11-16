import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const editCustomerSchema = z.object({
  customerId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  mobile: z.string().optional(),
  landline: z.string().optional(),
  email: z.string().email().optional(),
  homeAddress: z.string().optional(),
  officeAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  areaLocality: z.string().optional(),
  citizenship: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = editCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { customerId, email, ...customerData } = validation.data

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

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { user: true },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Update customer in a transaction
    await prisma.$transaction(async (tx) => {
      // Update customer data
      const updateData: any = {}
      Object.entries(customerData).forEach(([key, value]) => {
        if (value !== undefined) {
          // Convert dateOfBirth string to Date object
          if (key === 'dateOfBirth' && typeof value === 'string') {
            updateData[key] = new Date(value)
          } else {
            updateData[key] = value
          }
        }
      })

      if (Object.keys(updateData).length > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: updateData,
        })
      }

      // Update email if provided
      if (email && email !== customer.user.email) {
        // Check if email is already taken
        const existingUser = await tx.user.findUnique({
          where: { email },
        })

        if (existingUser && existingUser.id !== customer.userId) {
          throw new Error("Email already in use")
        }

        await tx.user.update({
          where: { id: customer.userId },
          data: { email },
        })
      }
    })

    // Log the admin action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "EDIT_CUSTOMER",
        entity: "CUSTOMER",
        entityId: customerId,
        customerId,
        details: `Updated customer details for ${customer.customerNumber}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    })

    // Fetch updated customer
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    })
  } catch (error: any) {
    // Safe error logging
    if (error && typeof error === 'object') {
      console.error("Error editing customer:", {
        message: error.message,
        code: error.code,
        name: error.name
      })
    } else {
      console.error("Error editing customer:", String(error))
    }
    
    if (error && error.message === "Email already in use") {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // Prisma validation errors
    if (error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate value: This email or mobile number is already in use" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: (error && error.message) ? error.message : "Failed to edit customer" },
      { status: 500 }
    )
  }
}
