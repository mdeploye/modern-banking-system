"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Loader2, User, Mail, Phone, CreditCard, Calendar } from "lucide-react"

interface Customer {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  dateOfBirth: string
  accountNumber: string
  accountType: string
  accountStatus: string
  balance: string
  isRestricted: boolean
  restrictionType: string | null
}

export default function CustomersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchCustomers()
    }
  }, [status, session, router])

  const fetchCustomers = async (query = "") => {
    setIsLoading(true)
    try {
      const url = query 
        ? `/api/admin/all-customers?search=${encodeURIComponent(query)}`
        : "/api/admin/all-customers"
      
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCustomers(searchQuery)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <Card>
          <CardHeader>
            <CardTitle>Customer Search</CardTitle>
            <CardDescription>
              Search by name, email, mobile, customer number, or account number
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    fetchCustomers()
                  }}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </form>

            {/* Results */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-4">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No customers found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {customers.length} customer{customers.length !== 1 ? 's' : ''} found
                </p>

                {customers.map((customer) => (
                  <Card key={customer.id} className="border hover:shadow-md transition-shadow">
                    <Link href={`/admin/customers/${customer.id}/edit`}>
                      <CardContent className="p-6 cursor-pointer">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {customer.firstName} {customer.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Customer #{customer.customerNumber}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={customer.accountStatus === "ACTIVE" ? "default" : customer.accountStatus === "PENDING" ? "secondary" : "destructive"}>
                                  {customer.accountStatus}
                                </Badge>
                                {customer.isRestricted && (
                                  <Badge variant="destructive">RESTRICTED</Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.mobile}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>DOB: {new Date(customer.dateOfBirth).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Account Details</span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Account Number:</span>
                                  <span className="font-mono font-medium">{customer.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Type:</span>
                                  <span className="font-medium">{customer.accountType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Balance:</span>
                                  <span className="font-bold text-lg text-primary">
                                    ${parseFloat(customer.balance).toFixed(2)}
                                  </span>
                                </div>
                                {customer.isRestricted && customer.restrictionType && (
                                  <div className="flex justify-between pt-2 border-t">
                                    <span className="text-muted-foreground">Restriction:</span>
                                    <span className="font-medium text-red-600">{customer.restrictionType}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                    
                    {/* Action buttons outside the link to prevent nested navigation */}
                    <div className="px-6 pb-6 flex gap-2">
                      <Link href={`/admin/credit?account=${customer.accountNumber}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="w-full">
                          Credit
                        </Button>
                      </Link>
                      <Link href={`/admin/debit?account=${customer.accountNumber}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="w-full">
                          Debit
                        </Button>
                      </Link>
                      <Link href={`/admin/restrictions?customer=${customer.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="w-full">
                          Restrictions
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
