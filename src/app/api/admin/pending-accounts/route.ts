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

    const pendingAccounts = await prisma.account.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedAccounts = pendingAccounts.map((account) => ({
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      customerNumber: account.customer.customerNumber,
      customerName: `${account.customer.firstName} ${account.customer.lastName}`,
      email: account.customer.user.email,
      mobile: account.customer.mobile,
      dateOfBirth: account.customer.dateOfBirth,
      address: account.customer.homeAddress,
      city: account.customer.city,
      state: account.customer.state,
      createdAt: account.createdAt,
    }))

    return NextResponse.json({ accounts: formattedAccounts })
  } catch (error: any) {
    console.error("Fetch pending accounts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending accounts" },
      { status: 500 }
    )
  }
}
