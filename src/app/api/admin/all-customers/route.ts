import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              // NOTE: Current Prisma StringFilter for this model doesn't support `mode`,
              // so we use simple `contains` filters (case-sensitive) for compatibility.
              { customerNumber: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { mobile: { contains: search } },
              { user: { email: { contains: search } } },
            ],
          }
        : {},
      include: {
        user: true,
        accounts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Flatten customers with their accounts (one row per account)
    const formattedCustomers: any[] = []
    
    customers.forEach((customer) => {
      if (customer.accounts.length === 0) {
        // Customer with no accounts
        formattedCustomers.push({
          id: customer.id,
          customerNumber: customer.customerNumber,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.user.email,
          mobile: customer.mobile,
          dateOfBirth: customer.dateOfBirth,
          accountNumber: "N/A",
          accountType: "N/A",
          accountStatus: "N/A",
          balance: "0",
          isRestricted: customer.isRestricted,
          restrictionType: customer.restrictionType,
        })
      } else {
        // Create a row for each account
        customer.accounts.forEach((account) => {
          formattedCustomers.push({
            id: customer.id,
            customerNumber: customer.customerNumber,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.user.email,
            mobile: customer.mobile,
            dateOfBirth: customer.dateOfBirth,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            accountStatus: account.status,
            balance: account.balance.toString(),
            isRestricted: customer.isRestricted,
            restrictionType: customer.restrictionType,
          })
        })
      }
    })

    return NextResponse.json({ customers: formattedCustomers })
  } catch (error: any) {
    console.error("Fetch customers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}
