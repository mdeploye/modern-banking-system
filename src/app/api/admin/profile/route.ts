import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get admin data
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({
      email: admin.user.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      adminNumber: admin.adminNumber,
      mobile: admin.mobile,
      gender: admin.gender,
      department: admin.department,
      dateOfBirth: admin.dateOfBirth,
      citizenship: admin.citizenship,
      pan: admin.pan,
      homeAddress: admin.homeAddress,
      lastLogin: admin.lastLogin,
      canApproveAccounts: admin.canApproveAccounts,
      canRestrictAccounts: admin.canRestrictAccounts,
      canCreditDebit: admin.canCreditDebit,
      canViewAllCustomers: admin.canViewAllCustomers,
      createdAt: admin.createdAt,
    })
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
