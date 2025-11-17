"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { formatCurrency, formatAccountNumber } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Send, 
  History, 
  User, 
  LogOut,
  MoreHorizontal,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { RestrictionModal } from "@/components/restriction-modal"
import { RestrictedAccountBanner } from "@/components/restricted-account-banner"
import { CanvasIcon } from "@/components/canvas-icon"
import { CanvasLogo } from "@/components/canvas-logo"

interface Account {
  id: string
  accountNumber: string
  accountType: string
  balance: string
  status: string
}

interface AccountData {
  customerNumber: string
  firstName: string
  lastName: string
  totalBalance: string
  isRestricted: boolean
  restrictionType: string | null
  restrictionReason: string | null
  restrictedAt: string | null
  accounts: Account[]
  checkingAccount: Account | null
  savingsAccount: Account | null
}

interface Transaction {
  id: string
  transactionId: string
  type: string
  amount: string
  balanceBefore: string
  balanceAfter: string
  description: string
  date: string
  uniqueIndex?: number // Optional index to ensure uniqueness
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<'checking' | 'savings'>('checking')
  const [isLoading, setIsLoading] = useState(true)
  const [showRestrictionModal, setShowRestrictionModal] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "CUSTOMER") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchAccountData()
      fetchRecentTransactions()
      // Check if user is restricted and show modal
      if (session?.user?.isRestricted) {
        setShowRestrictionModal(true)
      }
    }
  }, [status, session])

  const fetchAccountData = async () => {
    try {
      const response = await fetch("/api/customer/account")
      if (response.ok) {
        const data = await response.json()
        setAccountData(data)
      }
    } catch (error) {
      console.error("Failed to fetch account data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch("/api/customer/transactions")
      if (response.ok) {
        const data = await response.json()
        
        // Filter to ensure uniqueness by transactionId
        const uniqueTransactions = data.transactions
          .slice(0, 10) // Get more than we need in case there are duplicates
          .filter((txn: Transaction, index: number, self: Transaction[]) => 
            index === self.findIndex((t) => t.transactionId === txn.transactionId)
          )
          .slice(0, 3); // Then take just the first 3 unique ones
        
        // Add an extra index to each transaction to ensure key uniqueness
        const transactionsWithIndex = uniqueTransactions.map((txn: Transaction, index: number) => ({
          ...txn,
          uniqueIndex: index
        }));
        
        setRecentTransactions(transactionsWithIndex);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      // Ensure loading state is cleared even if transactions fail
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `${window.location.origin}/login` })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "CUSTOMER") {
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
      {/* Restriction Modal */}
      {showRestrictionModal && session?.user?.isRestricted && (
        <RestrictionModal
          restrictionType={session.user.restrictionType}
          restrictionReason={session.user.restrictionReason}
          onClose={() => setShowRestrictionModal(false)}
        />
      )}

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)}>
          <div 
            className="bg-white h-full w-80 max-w-[85%] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <CanvasLogo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-1">
              <Link href="/customer/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/customer/transfer" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
              </Link>
              <Link href="/customer/transactions" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <History className="mr-2 h-4 w-4" />
                  Transactions
                </Button>
              </Link>
              <Link href="/customer/profile" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link href="/customer/beneficiaries" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Beneficiaries
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMenuOpen(false)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMenuOpen(false)}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restriction Banner */}
      {accountData?.isRestricted && !showRestrictionModal && (
        <RestrictedAccountBanner
          restrictionType={accountData.restrictionType}
          restrictionReason={accountData.restrictionReason}
          restrictedAt={accountData.restrictedAt}
        />
      )}

      {/* Header - Mobile View */}
      <header className="bg-background sticky top-0 z-40 border-b md:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <CanvasIcon size={48} />
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Header - Desktop View */}
      <header className="bg-white border-b hidden md:block">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <CanvasLogo size="md" />
            <nav className="flex items-center gap-6">
              <Link href="/customer/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/customer/transfer">
                <Button variant="ghost" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
              </Link>
              <Link href="/customer/transactions">
                <Button variant="ghost" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  Transactions
                </Button>
              </Link>
              <Link href="/customer/profile">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile View */}
      <div className="md:hidden px-4 py-4">
        {/* Welcome Message */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {accountData?.firstName || 'User'}!</h2>
          <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
        </div>

        {/* Account Status Warning */}
        {(accountData?.checkingAccount?.status === "PENDING" || accountData?.savingsAccount?.status === "PENDING") && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800">Account Pending Approval</p>
            <p className="text-xs text-yellow-700 mt-1">
              Your account is under review. Transactions will be enabled after staff approval.
            </p>
          </div>
        )}

        {(accountData?.checkingAccount?.status === "SUSPENDED" || accountData?.savingsAccount?.status === "SUSPENDED") && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">Account Suspended</p>
            <p className="text-xs text-red-700 mt-1">
              Please contact customer support for assistance.
            </p>
          </div>
        )}

        {/* Account Selector */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSelectedAccount('checking')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedAccount === 'checking'
                ? 'bg-primary text-white'
                : 'bg-white text-muted-foreground border'
            }`}
          >
            Checking
          </button>
          <button
            onClick={() => setSelectedAccount('savings')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedAccount === 'savings'
                ? 'bg-primary text-white'
                : 'bg-white text-muted-foreground border'
            }`}
          >
            Savings
          </button>
        </div>

        {/* Account Card - Canvas Style */}
        <div className="mb-6">
          {selectedAccount === 'checking' && accountData?.checkingAccount && (
            <div className="canvas-account-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-90">Checking Account</p>
                  <p className="text-xs opacity-75 mt-1">
                    ••••{accountData.checkingAccount.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(parseFloat(accountData.checkingAccount.balance))}
                </p>
                <p className="text-sm opacity-90 mt-1">Available Balance</p>
              </div>

              <div className="flex justify-between items-center">
                <Link href="/customer/transfer">
                  <button className="canvas-circle-btn">
                    <Send className="h-5 w-5 text-primary" />
                  </button>
                </Link>
                <Link href="/customer/transactions">
                  <button className="canvas-circle-btn">
                    <History className="h-5 w-5 text-primary" />
                  </button>
                </Link>
                <Link href="/customer/profile">
                  <button className="canvas-circle-btn">
                    <User className="h-5 w-5 text-primary" />
                  </button>
                </Link>
                <button className="canvas-circle-btn">
                  <MoreHorizontal className="h-5 w-5 text-primary" />
                </button>
              </div>
            </div>
          )}

          {selectedAccount === 'savings' && accountData?.savingsAccount && (
            <div className="canvas-account-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-90">Savings Account</p>
                  <p className="text-xs opacity-75 mt-1">
                    ••••{accountData.savingsAccount.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(parseFloat(accountData.savingsAccount.balance))}
                </p>
                <p className="text-sm opacity-90 mt-1">Available Balance</p>
              </div>

            <div className="flex justify-between items-center">
              <Link href="/customer/transfer">
                <button className="canvas-circle-btn">
                  <Send className="h-5 w-5 text-primary" />
                </button>
              </Link>
              <Link href="/customer/transactions">
                <button className="canvas-circle-btn">
                  <History className="h-5 w-5 text-primary" />
                </button>
              </Link>
              <Link href="/customer/profile">
                <button className="canvas-circle-btn">
                  <User className="h-5 w-5 text-primary" />
                </button>
              </Link>
              <button className="canvas-circle-btn">
                <MoreHorizontal className="h-5 w-5 text-primary" />
              </button>
            </div>
            </div>
          )}
        </div>

        {/* Activity Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No transactions yet</p>
                  <Link href="/customer/transfer">
                    <Button size="sm" className="mt-2">Send Money</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {recentTransactions.map((txn, index) => {
                      const amount = Math.abs(parseFloat(txn.amount))
                      // Check if it's credit OR if balance increased (for TRANSFER type)
                      const isCredit = txn.type === 'CREDIT' || (parseFloat(txn.balanceAfter) > parseFloat(txn.balanceBefore))
                      // Generate a completely unique key using both index position and a property
                      const mobileKey = `mobile-${index}-${txn.description?.substring(0, 8) || ''}-${Date.now()}-${index}`
                      return (
                        <div key={mobileKey} className="canvas-activity-item px-4">
                          <div>
                            <p className="font-medium text-sm truncate">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(txn.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <p className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(amount)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="p-4">
                    <Link href="/customer/transactions">
                      <Button variant="link" className="w-full text-secondary">
                        View all activity
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {accountData?.firstName || 'User'}!</h1>
          <p className="text-muted-foreground mt-2">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Status Warning */}
            {(accountData?.checkingAccount?.status === "PENDING" || accountData?.savingsAccount?.status === "PENDING") && (
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">Account Pending Approval</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Your account is under review. Transactions will be enabled after staff approval.
                </p>
              </div>
            )}

            {(accountData?.checkingAccount?.status === "SUSPENDED" || accountData?.savingsAccount?.status === "SUSPENDED") && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-800">Account Suspended</p>
                <p className="text-xs text-red-700 mt-1">
                  Please contact customer support for assistance.
                </p>
              </div>
            )}

            {/* Main Account Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>
                  Total Balance Across All Accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Available Balance</p>
                    <p className="text-4xl font-bold text-primary">
                      {formatCurrency(parseFloat(accountData?.totalBalance || '0'))}
                    </p>
                  </div>

                  {/* Checking Account */}
                  {accountData?.checkingAccount && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Checking Account</p>
                          <p className="text-xs text-blue-700 font-mono">
                            {formatAccountNumber(accountData.checkingAccount.accountNumber)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${accountData.checkingAccount.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {accountData.checkingAccount.status}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(parseFloat(accountData.checkingAccount.balance))}
                      </p>
                    </div>
                  )}

                  {/* Savings Account */}
                  {accountData?.savingsAccount && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-green-900">Savings Account</p>
                          <p className="text-xs text-green-700 font-mono">
                            {formatAccountNumber(accountData.savingsAccount.accountNumber)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${accountData.savingsAccount.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {accountData.savingsAccount.status}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(parseFloat(accountData.savingsAccount.balance))}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href="/customer/transfer" className="flex-1">
                      <Button className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Send Money
                      </Button>
                    </Link>
                    <Link href="/customer/transactions" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <History className="mr-2 h-4 w-4" />
                        View Transactions
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Link href="/customer/transactions">
                    <Button variant="link" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((txn, index) => {
                      const amount = Math.abs(parseFloat(txn.amount))
                      // Check if it's credit OR if balance increased (for TRANSFER type)
                      const isCredit = txn.type === 'CREDIT' || (parseFloat(txn.balanceAfter) > parseFloat(txn.balanceBefore))
                      // Generate a completely unique key using both index position and a property
                      const desktopKey = `desktop-${index}-${txn.description?.substring(0, 8) || ''}-${Date.now()}-${index}`
                      return (
                        <div key={desktopKey} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                              {isCredit ? (
                                <ArrowDownRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{txn.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(txn.date), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <p className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(amount)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/customer/transfer">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </Button>
                </Link>
                <Link href="/customer/transactions">
                  <Button variant="outline" className="w-full justify-start">
                    <History className="mr-2 h-4 w-4" />
                    Transaction History
                  </Button>
                </Link>
                <Link href="/customer/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Routing Number</span>
                  <span className="font-mono font-medium">302 075 830</span>
                </div>
                
                {accountData?.checkingAccount && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Checking</span>
                      <span className="font-mono font-medium text-xs">{formatAccountNumber(accountData.checkingAccount.accountNumber)}</span>
                    </div>
                  </>
                )}
                
                {accountData?.savingsAccount && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Savings</span>
                      <span className="font-mono font-medium text-xs">{formatAccountNumber(accountData.savingsAccount.accountNumber)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Customer #</span>
                  <span className="font-medium">{accountData?.customerNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Balance</span>
                  <span className="font-bold text-primary">{formatCurrency(parseFloat(accountData?.totalBalance || '0'))}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
