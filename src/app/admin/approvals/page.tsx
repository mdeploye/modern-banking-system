"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Loader2, Calendar, User, Mail, Phone } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PendingAccount {
  id: string
  accountNumber: string
  accountType: string
  customerNumber: string
  customerName: string
  email: string
  mobile: string
  dateOfBirth: string
  address: string
  city: string
  state: string
  createdAt: string
}

export default function ApprovalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [accounts, setAccounts] = useState<PendingAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      fetchPendingAccounts()
    }
  }, [session])

  const fetchPendingAccounts = async () => {
    try {
      const response = await fetch("/api/admin/pending-accounts")
      const data = await response.json()
      
      if (response.ok) {
        setAccounts(data.accounts)
      } else {
        toast({
          title: "Error",
          description: "Failed to load pending accounts",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (accountId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(accountId)
    
    try {
      const response = await fetch("/api/admin/approve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: action === "APPROVE" ? "Account Approved" : "Account Rejected",
          description: `Account ${data.account.accountNumber} has been ${action.toLowerCase()}d`,
        })
        
        // Remove from list
        setAccounts(accounts.filter(acc => acc.id !== accountId))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process account",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process account",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/login")
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

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Approvals</CardTitle>
            <CardDescription>
              Review and approve pending customer accounts ({accounts.length} pending)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No pending approvals</p>
                <p className="text-sm">All accounts have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        {/* Customer Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{account.customerName}</h3>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              PENDING
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Customer #:</span>
                              <span className="font-medium">{account.customerNumber}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Account #:</span>
                              <span className="font-medium">{account.accountNumber}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{account.email}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{account.mobile}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Account Type:</span>
                              <Badge variant="secondary">{account.accountType}</Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Applied:</span>
                              <span className="font-medium">
                                {new Date(account.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="ml-2 font-medium">
                              {account.address}, {account.city}, {account.state}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex md:flex-col gap-2 md:justify-center">
                          <Button
                            onClick={() => handleApproval(account.id, "APPROVE")}
                            disabled={processingId === account.id}
                            className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                          >
                            {processingId === account.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>

                          <Button
                            onClick={() => handleApproval(account.id, "REJECT")}
                            disabled={processingId === account.id}
                            variant="destructive"
                            className="flex-1 md:flex-none"
                          >
                            {processingId === account.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
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
