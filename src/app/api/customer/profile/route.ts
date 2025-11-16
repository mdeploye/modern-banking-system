import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get customer data with accounts
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        accounts: {
          select: {
            accountNumber: true,
            accountType: true,
            status: true,
            balance: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({
      email: customer.user.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      customerNumber: customer.customerNumber,
      mobile: customer.mobile,
      landline: customer.landline,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth,
      ssn: customer.ssn,
      driversLicense: customer.driversLicense,
      citizenship: customer.citizenship,
      homeAddress: customer.homeAddress,
      officeAddress: customer.officeAddress,
      country: customer.country,
      state: customer.state,
      city: customer.city,
      zipCode: customer.zipCode,
      areaLocality: customer.areaLocality,
      nomineeName: customer.nomineeName,
      nomineeAccount: customer.nomineeAccount,
      accounts: customer.accounts,
      createdAt: customer.createdAt,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
