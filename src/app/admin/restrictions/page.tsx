"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shield, Search, Loader2, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/format"

interface Customer {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  accounts: Array<{
    accountNumber: string
    accountType: string
    status: string
    balance: string
  }>
}

export default function RestrictionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [restrictAction, setRestrictAction] = useState<"RESTRICT" | "UNRESTRICT" | null>(null)
  const [reason, setReason] = useState("")
  const [restrictionType, setRestrictionType] = useState<string>("FROZEN")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchCustomers()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm)
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/all-customers")
      if (response.ok) {
        const data = await response.json()
        
        // Group flattened data by customer ID to avoid duplicates
        const customerMap = new Map<string, Customer>()
        
        data.customers.forEach((row: any) => {
          if (!customerMap.has(row.id)) {
            customerMap.set(row.id, {
              id: row.id,
              customerNumber: row.customerNumber,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              mobile: row.mobile,
              accounts: [],
            })
          }
          
          const customer = customerMap.get(row.id)!
          if (row.accountNumber !== "N/A") {
            customer.accounts.push({
              accountNumber: row.accountNumber,
              accountType: row.accountType,
              status: row.accountStatus,
              balance: row.balance,
            })
          }
        })
        
        const groupedCustomers = Array.from(customerMap.values())
        setCustomers(groupedCustomers)
        setFilteredCustomers(groupedCustomers)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestrict = async () => {
    if (!selectedCustomer || !restrictAction) return

    setProcessing(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/restrict-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          action: restrictAction,
          reason: reason,
          restrictionType: restrictAction === "RESTRICT" ? restrictionType : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setReason("")
        // Refresh customers list
        await fetchCustomers()
        setTimeout(() => {
          setSelectedCustomer(null)
          setRestrictAction(null)
          setSuccess(false)
        }, 2000)
      } else {
        setError(data.error || "Failed to update restriction")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setProcessing(false)
    }
  }

  const getAccountStatus = (accounts: any[]) => {
    if (accounts.every(acc => acc.status === "ACTIVE")) return "ACTIVE"
    if (accounts.every(acc => acc.status === "SUSPENDED")) return "SUSPENDED"
    if (accounts.some(acc => acc.status === "PENDING")) return "PENDING"
    return "MIXED"
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Account Restrictions
          </h1>
          <p className="text-muted-foreground mt-1">Restrict or unrestrict customer accounts</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by customer number, name, email, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            <CardDescription>Click on a customer to manage restrictions</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No customers found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => {
                  const accountStatus = getAccountStatus(customer.accounts)
                  return (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setRestrictAction(accountStatus === "SUSPENDED" ? "UNRESTRICT" : "RESTRICT")
                        setError("")
                        setSuccess(false)
                      }}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <Badge
                              variant={
                                accountStatus === "ACTIVE"
                                  ? "default"
                                  : accountStatus === "SUSPENDED"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {accountStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {customer.customerNumber} • {customer.email}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {customer.accounts.map((acc) => (
                              <span key={acc.accountNumber}>
                                {acc.accountType}: {acc.accountNumber} ({acc.status})
                              </span>
                            ))}
                          </div>
                        </div>
                        <Shield
                          className={
                            accountStatus === "SUSPENDED"
                              ? "h-5 w-5 text-red-600"
                              : "h-5 w-5 text-muted-foreground"
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restriction Modal */}
      {selectedCustomer && restrictAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {restrictAction === "RESTRICT" ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {restrictAction === "RESTRICT" ? "Restrict Customer" : "Unrestrict Customer"}
              </CardTitle>
              <CardDescription>
                {selectedCustomer.firstName} {selectedCustomer.lastName} ({selectedCustomer.customerNumber})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="font-medium text-green-600">
                    Customer {restrictAction === "RESTRICT" ? "restricted" : "unrestricted"} successfully!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-900">
                          {restrictAction === "RESTRICT" ? "Warning" : "Confirmation"}
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {restrictAction === "RESTRICT"
                            ? "This will suspend all customer accounts and prevent transactions."
                            : "This will reactivate all customer accounts."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Accounts to be affected:</p>
                    {selectedCustomer.accounts.map((acc) => (
                      <div key={acc.accountNumber} className="text-sm p-2 bg-muted rounded">
                        {acc.accountType === "CURRENT" ? "Checking" : "Savings"}: {acc.accountNumber}
                      </div>
                    ))}
                  </div>

                  {restrictAction === "RESTRICT" && (
                    <div>
                      <Label htmlFor="restrictionType">Restriction Type</Label>
                      <Select value={restrictionType} onValueChange={setRestrictionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select restriction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FROZEN">🔒 Frozen - All transactions blocked</SelectItem>
                          <SelectItem value="TRANSFER_BLOCKED">🚫 Transfer Blocked - No transfers allowed</SelectItem>
                          <SelectItem value="WITHDRAWAL_LIMIT">⚠️ Withdrawal Limit - Limited withdrawals</SelectItem>
                          <SelectItem value="PENDING_VERIFICATION">🔍 Pending Verification - Additional verification required</SelectItem>
                          <SelectItem value="SUSPICIOUS_ACTIVITY">🛡️ Suspicious Activity - Account under review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reason">Reason (Required)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter detailed reason for this action..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleRestrict}
                      disabled={processing || (restrictAction === "RESTRICT" && !reason)}
                      variant={restrictAction === "RESTRICT" ? "destructive" : "default"}
                      className="flex-1"
                    >
                      {processing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                      ) : restrictAction === "RESTRICT" ? (
                        "Restrict Customer"
                      ) : (
                        "Unrestrict Customer"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setRestrictAction(null)
                        setReason("")
                        setError("")
                      }}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
