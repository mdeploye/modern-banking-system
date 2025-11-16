import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const editProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  mobile: z.string().optional(),
  landline: z.string().optional(),
  homeAddress: z.string().optional(),
  officeAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().length(5).optional(),
  areaLocality: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = editProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    // Update customer profile
    const customer = await prisma.customer.update({
      where: { userId: session.user.id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        mobile: customer.mobile,
        landline: customer.landline,
        homeAddress: customer.homeAddress,
        officeAddress: customer.officeAddress,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        areaLocality: customer.areaLocality,
        email: customer.user.email,
      },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
