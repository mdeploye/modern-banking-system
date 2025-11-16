import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
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
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: customer.id,
      customerNumber: customer.customerNumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.user.email,
      mobile: customer.mobile,
      landline: customer.landline,
      dateOfBirth: customer.dateOfBirth,
      gender: customer.gender,
      ssn: customer.ssn,
      driversLicense: customer.driversLicense,
      citizenship: customer.citizenship,
      homeAddress: customer.homeAddress,
      officeAddress: customer.officeAddress,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      areaLocality: customer.areaLocality,
      country: customer.country,
      accounts: customer.accounts,
    })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    )
  }
}
