"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, AlertCircle, Search, DollarSign, TrendingUp } from "lucide-react"

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

export default function GenerateTransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [targetBalance, setTargetBalance] = useState("500000")
  const [presetBalance, setPresetBalance] = useState("500000")
  const [startDate, setStartDate] = useState("2023-01-01")
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

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
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        // Group flattened data by customer ID
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

  const handlePresetChange = (value: string) => {
    setPresetBalance(value)
    setTargetBalance(value)
  }

  const handleGenerate = async () => {
    if (!selectedCustomer) return

    setIsGenerating(true)
    setError("")
    setSuccess(false)
    setResult(null)

    try {
      const response = await fetch("/api/admin/generate-luxury-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerNumber: selectedCustomer.customerNumber,
          targetBalance: parseFloat(targetBalance),
          startDate,
          endDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setResult(data)
        // Refresh customer list to show updated balance
        await fetchCustomers()
      } else {
        setError(data.error || "Failed to generate transactions")
      }
    } catch (error) {
      setError("An error occurred while generating transactions")
    } finally {
      setIsGenerating(false)
    }
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Generate Luxury Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            Create high-class transaction histories with luxury lifestyle spending patterns
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Customer Selection */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Select Customer</CardTitle>
                <CardDescription>Choose a customer to generate transactions for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, customer number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No customers found</p>
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setError("")
                          setSuccess(false)
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedCustomer?.id === customer.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer.customerNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {customer.email}
                            </p>
                          </div>
                          {selectedCustomer?.id === customer.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {customer.accounts.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {customer.accounts.map((acc) => (
                              <span key={acc.accountNumber} className="mr-3">
                                {acc.accountType}: ${parseFloat(acc.balance).toLocaleString()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Configuration & Generate */}
          <div className="space-y-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Settings</CardTitle>
                <CardDescription>Configure the transaction generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Balance */}
                <div>
                  <Label htmlFor="preset">Balance Preset</Label>
                  <Select value={presetBalance} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preset balance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50000">💵 Basic - $50K</SelectItem>
                      <SelectItem value="100000">💰 Comfortable - $100K</SelectItem>
                      <SelectItem value="250000">💎 Affluent - $250K</SelectItem>
                      <SelectItem value="500000">🏆 Wealthy - $500K</SelectItem>
                      <SelectItem value="1000000">💼 Millionaire - $1M</SelectItem>
                      <SelectItem value="2000000">🌟 Multi-Millionaire - $2M</SelectItem>
                      <SelectItem value="5000000">👑 Very Wealthy - $5M</SelectItem>
                      <SelectItem value="10000000">🚀 Ultra Wealthy - $10M</SelectItem>
                      <SelectItem value="50000000">💸 Billionaire - $50M</SelectItem>
                      <SelectItem value="100000000">🏰 Ultra Billionaire - $100M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Balance */}
                <div>
                  <Label htmlFor="balance">Target Balance (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="balance"
                      type="number"
                      value={targetBalance}
                      onChange={(e) => setTargetBalance(e.target.value)}
                      placeholder="500000"
                      className="pl-10"
                      min="50000"
                      step="10000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Final account balance: ${parseFloat(targetBalance || "0").toLocaleString()}
                  </p>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900">What will be generated:</p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Luxury transaction history for selected date range</li>
                    <li>Income: Stocks, crypto, real estate, investments</li>
                    <li>Expenses: Jets, yachts, cars, watches, casinos, clubs</li>
                    <li>Balanced income/expense ratio</li>
                  </ul>
                </div>

                {/* Warning */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Warning</p>
                      <p className="text-xs text-orange-700 mt-1">
                        This will delete all existing transactions for this customer's accounts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedCustomer || isGenerating || !targetBalance}
                  className="w-full h-12"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Transactions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Luxury Transactions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {success && result && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 text-lg">Success!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Luxury transaction history generated successfully
                      </p>

                      <div className="mt-4 space-y-2 bg-white rounded-lg p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Transactions Generated:</span>
                          <span className="font-medium">{result.transactionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Credits:</span>
                          <span className="font-medium text-green-600">
                            ${result.totalCredits?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Debits:</span>
                          <span className="font-medium text-red-600">
                            ${result.totalDebits?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="font-medium">Final Balance:</span>
                          <span className="font-bold text-lg text-primary">
                            ${result.finalBalance?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Link href={`/admin/customers/${selectedCustomer?.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Customer
                          </Button>
                        </Link>
                        <Button
                          onClick={() => {
                            setSuccess(false)
                            setSelectedCustomer(null)
                            setResult(null)
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Generate Another
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
