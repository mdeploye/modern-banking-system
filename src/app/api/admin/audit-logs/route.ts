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
    const limit = parseInt(searchParams.get("limit") || "100")

    const logs = await prisma.auditLog.findMany({
      include: {
        admin: true,
        customer: true,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    })

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      adminName: `${log.admin!.firstName} ${log.admin!.lastName}`,
      adminNumber: log.admin!.adminNumber,
      customerName: log.customer ? `${log.customer.firstName} ${log.customer.lastName}` : null,
      customerNumber: log.customer?.customerNumber,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.timestamp,
    }))

    return NextResponse.json({ logs: formattedLogs })
  } catch (error: any) {
    console.error("Fetch audit logs error:", error)
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}
