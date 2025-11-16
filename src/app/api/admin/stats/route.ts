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

    // Get stats
    const [pendingApprovals, totalCustomers, activeAccounts, restrictedAccounts, pendingTransactions] = await Promise.all([
      prisma.account.count({
        where: { status: "PENDING" },
      }),
      prisma.customer.count(),
      prisma.account.count({
        where: { status: "ACTIVE" },
      }),
      prisma.customer.count({
        where: { isRestricted: true },
      }),
      prisma.transaction.count({
        where: { status: "PENDING_APPROVAL" },
      }),
    ])

    return NextResponse.json({
      pendingApprovals,
      totalCustomers,
      activeAccounts,
      restrictedAccounts,
      pendingTransactions,
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
