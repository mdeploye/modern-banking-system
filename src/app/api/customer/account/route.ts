import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const customerId = session.user.customerId

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Fetch customer data with all accounts
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        accounts: {
          orderBy: { accountType: 'asc' }, // CURRENT (checking) first, then SAVING
        },
      },
    })

    if (!customer || customer.accounts.length === 0) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Separate accounts by type
    const checkingAccount = customer.accounts.find(acc => acc.accountType === 'CURRENT')
    const savingsAccount = customer.accounts.find(acc => acc.accountType === 'SAVING')

    // Calculate total balance
    const totalBalance = customer.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0)

    return NextResponse.json({
      customerNumber: customer.customerNumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
      totalBalance: totalBalance.toString(),
      isRestricted: customer.isRestricted,
      restrictionType: customer.restrictionType,
      restrictionReason: customer.restrictionReason,
      restrictedAt: customer.restrictedAt,
      accounts: customer.accounts.map(acc => ({
        id: acc.id,
        accountNumber: acc.accountNumber,
        accountType: acc.accountType,
        balance: acc.balance.toString(),
        status: acc.status,
      })),
      checkingAccount: checkingAccount ? {
        id: checkingAccount.id,
        accountNumber: checkingAccount.accountNumber,
        balance: checkingAccount.balance.toString(),
        status: checkingAccount.status,
      } : null,
      savingsAccount: savingsAccount ? {
        id: savingsAccount.id,
        accountNumber: savingsAccount.accountNumber,
        balance: savingsAccount.balance.toString(),
        status: savingsAccount.status,
      } : null,
    })
  } catch (error) {
    console.error("Account fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch account data" },
      { status: 500 }
    )
  }
}
