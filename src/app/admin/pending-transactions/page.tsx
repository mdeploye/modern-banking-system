"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Loader2, Clock, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PendingTransaction {
  id: string
  transactionId: string
  customerName: string
  accountNumber: string
  amount: number
  recipientAccount: string
  description: string
  remark: string | null
  date: string
}

export default function PendingTransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<PendingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      fetchPendingTransactions()
    }
  }, [session])

  const fetchPendingTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/pending-transactions")
      const data = await response.json()
      if (response.ok) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (txn: PendingTransaction) => {
    setProcessingId(txn.transactionId)
    
    try {
      const response = await fetch("/api/admin/approve-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionId: txn.transactionId, 
          action: "APPROVE" 
        }),
      })

      if (response.ok) {
        setTransactions(transactions.filter(t => t.transactionId !== txn.transactionId))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to approve")
      }
    } catch (error) {
      alert("Failed to approve transaction")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = (txn: PendingTransaction) => {
    setSelectedTransaction(txn)
    setShowRejectDialog(true)
  }

  const confirmReject = async () => {
    if (!selectedTransaction) return
    
    setProcessingId(selectedTransaction.transactionId)
    setShowRejectDialog(false)
    
    try {
      const response = await fetch("/api/admin/approve-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionId: selectedTransaction.transactionId, 
          action: "REJECT",
          reason: rejectReason || "No reason provided" 
        }),
      })

      if (response.ok) {
        setTransactions(transactions.filter(t => t.transactionId !== selectedTransaction.transactionId))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to reject")
      }
    } catch (error) {
      alert("Failed to reject transaction")
    } finally {
      setProcessingId(null)
      setSelectedTransaction(null)
      setRejectReason("")
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Transaction Approvals</CardTitle>
                <CardDescription>
                  Review and approve high-value transfers (≥ $500)
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {transactions.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No pending transactions</p>
                <p className="text-sm mt-2">All high-value transfers have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((txn) => (
                  <Card key={txn.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{txn.customerName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Customer Account: {txn.accountNumber}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Clock className="h-3 w-3 mr-1" />
                              PENDING
                            </Badge>
                          </div>

                          {/* Transaction Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Recipient Account:</span>
                              <span className="ml-2 font-mono font-medium">{txn.recipientAccount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="ml-2 font-bold text-lg text-orange-600">
                                ${txn.amount.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Transaction ID:</span>
                              <span className="ml-2 font-mono text-xs">{txn.transactionId}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <span className="ml-2">
                                {new Date(txn.date).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="text-sm bg-muted/50 p-3 rounded-lg">
                            <p className="text-muted-foreground text-xs mb-1">Description:</p>
                            <p className="font-medium">{txn.description}</p>
                          </div>

                          {/* Remark */}
                          {txn.remark && (
                            <div className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-blue-600 font-medium">System Note:</p>
                                <p className="text-blue-700">{txn.remark}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-3 lg:justify-center">
                          <Button
                            onClick={() => handleApprove(txn)}
                            disabled={processingId === txn.transactionId}
                            className="bg-green-600 hover:bg-green-700 flex-1 lg:flex-none lg:min-w-[140px]"
                            size="lg"
                          >
                            {processingId === txn.transactionId ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>

                          <Button
                            onClick={() => handleReject(txn)}
                            disabled={processingId === txn.transactionId}
                            variant="destructive"
                            className="flex-1 lg:flex-none lg:min-w-[140px]"
                            size="lg"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Suspicious activity detected, insufficient verification..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
