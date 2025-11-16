"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { CustomerNav } from "@/components/customer-nav"
import { ActionBlockedModal } from "@/components/action-blocked-modal"
import { RestrictedAccountBanner } from "@/components/restricted-account-banner"
import { useEffect } from "react"

export default function FundTransfer() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [accountData, setAccountData] = useState<any>(null)

  const [formData, setFormData] = useState({
    toAccountNumber: "",
    amount: "",
    description: "",
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchAccountData()
    }
  }, [status])

  const fetchAccountData = async () => {
    try {
      const response = await fetch("/api/customer/account")
      if (response.ok) {
        const data = await response.json()
        setAccountData(data)
      }
    } catch (error) {
      console.error("Failed to fetch account data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if account is restricted
    if (accountData?.isRestricted && (accountData.restrictionType === "FROZEN" || accountData.restrictionType === "TRANSFER_BLOCKED")) {
      setShowBlockedModal(true)
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/customer/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAccountNumber: formData.toAccountNumber,
          amount: parseFloat(formData.amount),
          description: formData.description,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTransactionDetails(data.transaction)
      } else {
        setError(data.error || "Transfer failed. Please try again")
      }
    } catch (error) {
      setError("Failed to process transfer. Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  if (success && transactionDetails) {
    const isPending = transactionDetails.status === "PENDING_APPROVAL"
    
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav />
        <div className="p-8">
          <div className="container mx-auto max-w-md">
            <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                {isPending ? (
                  <div className="bg-orange-100 p-4 rounded-full">
                    <Clock className="h-12 w-12 text-orange-600" />
                  </div>
                ) : (
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                )}
              </div>

              {isPending ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">Pending Admin Approval</h2>
                  <p className="text-muted-foreground mb-6">
                    Transfers of $500 or more require admin approval
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your money has been sent successfully
                  </p>
                </>
              )}

              <div className="bg-gray-100 p-4 rounded-lg space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-lg">${transactionDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium">{transactionDetails.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium">{transactionDetails.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium text-xs">{transactionDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${isPending ? 'text-orange-600' : 'text-green-600'}`}>
                    {isPending ? 'Pending Approval' : 'Completed'}
                  </span>
                </div>
                {!isPending && transactionDetails.newBalance !== undefined && (
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-muted-foreground">New Balance:</span>
                    <span className="font-bold text-lg text-green-600">
                      ${transactionDetails.newBalance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {isPending && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-left">
                  <p className="text-blue-800">
                    <strong>Note:</strong> Your balance will be updated once an admin approves this transaction.
                    You will be notified when the approval is complete.
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setFormData({ toAccountNumber: "", amount: "", description: "" })
                  }}
                  className="w-full"
                >
                  Send Another Transfer
                </Button>
                <Link href="/customer/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Restriction Banner */}
      {accountData?.isRestricted && (
        <RestrictedAccountBanner
          restrictionType={accountData.restrictionType}
          restrictionReason={accountData.restrictionReason}
          restrictedAt={accountData.restrictedAt}
        />
      )}
      
      {/* Action Blocked Modal */}
      <ActionBlockedModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        actionType="transfer"
        restrictionType={accountData?.restrictionType}
        restrictionReason={accountData?.restrictionReason}
      />
      
      <CustomerNav />
      
      <div className="p-4 sm:p-8">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Send Money</CardTitle>
              <CardDescription>Transfer funds to another account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Transfer Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toAccountNumber">Recipient Account Number *</Label>
                <Input
                  id="toAccountNumber"
                  type="text"
                  placeholder="Enter account number"
                  value={formData.toAccountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, toAccountNumber: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="100.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="e.g., Payment for services"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
