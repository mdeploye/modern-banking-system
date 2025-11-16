import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search") || ""

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { transactionId: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            {
              account: {
                customer: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" as const } },
                    { lastName: { contains: search, mode: "insensitive" as const } },
                    { customerNumber: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              },
            },
          ],
        }
      : {}

    // Get transactions with customer and account info
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: {
          include: {
            customer: {
              select: {
                id: true,
                customerNumber: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { transactionDate: "desc" },
      take: limit,
      skip: offset,
    })

    // Get total count
    const totalCount = await prisma.transaction.count({ where: whereClause })

    // Format response
    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      transactionId: txn.transactionId,
      accountNumber: txn.account.accountNumber,
      accountType: txn.account.accountType,
      customerNumber: txn.account.customer.customerNumber,
      customerName: `${txn.account.customer.firstName} ${txn.account.customer.lastName}`,
      customerId: txn.account.customer.id,
      type: txn.type,
      amount: txn.amount.toString(),
      balanceBefore: txn.balanceBefore.toString(),
      balanceAfter: txn.balanceAfter.toString(),
      description: txn.description,
      status: txn.status,
      transactionDate: txn.transactionDate,
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      totalCount,
      hasMore: offset + limit < totalCount,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
