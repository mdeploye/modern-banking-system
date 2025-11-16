import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const editAdminProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  mobile: z.string().optional(),
  homeAddress: z.string().optional(),
  department: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = editAdminProfileSchema.safeParse(body)

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

    // Update admin profile
    const admin = await prisma.admin.update({
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
      admin: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        mobile: admin.mobile,
        homeAddress: admin.homeAddress,
        department: admin.department,
        email: admin.user.email,
      },
    })
  } catch (error) {
    console.error("Error updating admin profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
