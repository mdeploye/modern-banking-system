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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, History, Search, Edit, Loader2, ArrowRightLeft, RefreshCcw } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  transactionId: string
  accountNumber: string
  accountType: string
  customerNumber: string
  customerName: string
  customerId: string
  type: string
  amount: string
  balanceBefore: string
  balanceAfter: string
  description: string
  status: string
  transactionDate: string
}

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalCount, setTotalCount] = useState(0)
  
  // Edit modal
  const [editModal, setEditModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchTransactions()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router, searchTerm])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "100",
        offset: "0",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/transactions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions)
        setTotalCount(data.totalCount)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (txn: Transaction) => {
    setSelectedTransaction(txn)
    setEditDescription(txn.description)
    setEditAmount(txn.amount)
    setEditStatus(txn.status)
    setEditModal(true)
  }

  const handleEditTransaction = async () => {
    if (!selectedTransaction) return

    setIsEditing(true)
    try {
      const response = await fetch("/api/admin/transactions/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: selectedTransaction.transactionId,
          description: editDescription,
          amount: parseFloat(editAmount),
          status: editStatus,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        })
        setEditModal(false)
        fetchTransactions()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update transaction",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  if (status === "loading" || !session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (session.user.role !== "ADMIN") {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={fetchTransactions} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              System-Wide Transactions
            </CardTitle>
            <CardDescription>View and manage all customer transactions ({totalCount} total)</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, customer name, or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Transactions Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-sm">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-sm">Transaction ID</th>
                      <th className="text-left py-3 px-2 font-medium text-sm">Customer</th>
                      <th className="text-left py-3 px-2 font-medium text-sm">Account</th>
                      <th className="text-left py-3 px-2 font-medium text-sm">Type</th>
                      <th className="text-left py-3 px-2 font-medium text-sm">Description</th>
                      <th className="text-right py-3 px-2 font-medium text-sm">Amount</th>
                      <th className="text-center py-3 px-2 font-medium text-sm">Status</th>
                      <th className="text-center py-3 px-2 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm">
                          {format(new Date(txn.transactionDate), "MMM dd, yyyy HH:mm")}
                        </td>
                        <td className="py-3 px-2 text-sm font-mono">{txn.transactionId}</td>
                        <td className="py-3 px-2 text-sm">
                          <div>
                            <p className="font-medium">{txn.customerName}</p>
                            <p className="text-xs text-muted-foreground">{txn.customerNumber}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <div>
                            <p className="font-mono">{txn.accountNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.accountType === "CURRENT" ? "Checking" : "Savings"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={txn.type === "CREDIT" ? "default" : "secondary"}>
                            {txn.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm max-w-xs truncate">{txn.description}</td>
                        <td className="py-3 px-2 text-sm text-right font-medium">
                          <span className={txn.type === "CREDIT" ? "text-green-600" : "text-red-600"}>
                            {txn.type === "CREDIT" ? "+" : "-"}
                            {formatCurrency(parseFloat(txn.amount))}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            variant={
                              txn.status === "COMPLETED"
                                ? "default"
                                : txn.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {txn.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(txn)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inter-Account Transfer Link */}
        <div className="mt-6">
          <Link href="/admin/customers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Inter-Account Transfer</h3>
                    <p className="text-sm text-muted-foreground">
                      Transfer funds between customer accounts (Savings ↔ Checking)
                    </p>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Modify transaction details. Balance adjustments will be applied automatically.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Transaction ID</Label>
                <p className="font-mono text-sm">{selectedTransaction.transactionId}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {formatCurrency(parseFloat(selectedTransaction.amount))}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)} disabled={isEditing}>
              Cancel
            </Button>
            <Button onClick={handleEditTransaction} disabled={isEditing}>
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
