"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CheckCircle, 
  Search, 
  DollarSign,
  LogOut,
  ClipboardList,
  UserCheck,
  Shield,
  Clock,
  Sparkles
} from "lucide-react"
import { CanvasLogo } from "@/components/canvas-logo"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalCustomers: 0,
    activeAccounts: 0,
    restrictedAccounts: 0,
    pendingTransactions: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `${window.location.origin}/login` })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CanvasLogo size="md" showText={false} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground brand-text">canvas</span>
              <span className="text-xs text-muted-foreground brand-text">admin portal</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              Admin: {session.user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Accounts awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeAccounts}</div>
              <p className="text-xs text-muted-foreground">
                Approved and active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restricted</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.restrictedAccounts}</div>
              <p className="text-xs text-muted-foreground">
                Accounts with restrictions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Admin Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/approvals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Approve Accounts</CardTitle>
                  <CardDescription>Review and approve pending accounts</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/pending-transactions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-500">
                <CardHeader>
                  <Clock className="h-8 w-8 text-orange-600 mb-2" />
                  <CardTitle className="text-lg">Pending Transactions</CardTitle>
                  <CardDescription>
                    Approve high-value transfers
                    {stats.pendingTransactions > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-orange-600 rounded-full">
                        {stats.pendingTransactions}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/customers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <Search className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Search Customers</CardTitle>
                  <CardDescription>Find and manage customer accounts</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/credit">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Credit Account</CardTitle>
                  <CardDescription>Deposit funds to customer account</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/debit">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-red-600 mb-2" />
                  <CardTitle className="text-lg">Debit Account</CardTitle>
                  <CardDescription>Withdraw funds from customer account</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/restrictions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <Shield className="h-8 w-8 text-orange-600 mb-2" />
                  <CardTitle className="text-lg">Manage Restrictions</CardTitle>
                  <CardDescription>Apply or remove account restrictions</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/generate-transactions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-yellow-600 mb-2" />
                  <CardTitle className="text-lg">Generate Luxury Transactions</CardTitle>
                  <CardDescription>Create high-class transaction histories</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/transactions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <ClipboardList className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">All Transactions</CardTitle>
                  <CardDescription>View system-wide transactions</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/audit-logs">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <ClipboardList className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Audit Logs</CardTitle>
                  <CardDescription>View system activity logs</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>System configuration</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activity and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <Link href="/admin/audit-logs">
                <Button variant="link" className="mt-2">
                  View all logs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
