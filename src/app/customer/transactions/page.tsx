"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/format"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerNav } from "@/components/customer-nav"

interface Transaction {
  id: string
  transactionId: string
  type: string
  amount: string
  balanceBefore: string
  balanceAfter: string
  description: string
  status: string
  accountNumber?: string
  accountType?: string
  senderAccountNumber: string | null
  recipientAccountNumber: string | null
  date: string
  uniqueIndex?: number // Optional index to ensure uniqueness
}

export default function Transactions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "CUSTOMER") {
      fetchTransactions()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/customer/transactions")
      if (response.ok) {
        const data = await response.json()
        
        // Filter to ensure uniqueness by transactionId
        const uniqueTransactions = data.transactions
          .filter((txn: Transaction, index: number, self: Transaction[]) => 
            index === self.findIndex((t) => t.transactionId === txn.transactionId)
          )
        
        // Add an extra index to each transaction to ensure key uniqueness
        const transactionsWithIndex = uniqueTransactions.map((txn: Transaction, index: number) => ({
          ...txn,
          uniqueIndex: index
        }));
        
        setTransactions(transactionsWithIndex);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionIcon = (txn: Transaction) => {
    // Determine credit/debit purely from type for consistent UI
    const isCredit = txn.type === 'CREDIT' || txn.type === 'OPENING'
    return isCredit ? (
      <div className="bg-green-100 p-2 rounded-full">
        <ArrowDownRight className="h-4 w-4 text-green-600" />
      </div>
    ) : (
      <div className="bg-red-100 p-2 rounded-full">
        <ArrowUpRight className="h-4 w-4 text-red-600" />
      </div>
    )
  }

  const getTransactionColor = (txn: Transaction) => {
    // Determine credit/debit purely from type for consistent UI
    const isCredit = txn.type === 'CREDIT' || txn.type === 'OPENING'
    return isCredit ? "text-green-600" : "text-red-600"
  }

  const formatTransactionAmount = (txn: Transaction) => {
    const num = Math.abs(parseFloat(txn.amount))
    const formatted = formatCurrency(num)
    // Determine credit/debit purely from type for consistent UI
    const isCredit = txn.type === 'CREDIT' || txn.type === 'OPENING'
    return isCredit ? `+${formatted}` : `-${formatted}`
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <CustomerNav />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Transaction History</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-sm mt-2">Your transaction history will appear here</p>
                <Link href="/customer/transfer">
                  <Button className="mt-4">Make Your First Transfer</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {transactions.map((txn, index) => {
                  // Create a completely unique key that doesn't rely on txn.id
                  const uniqueKey = `txn-item-${index}-${Math.random().toString(36).substring(2, 9)}`;
                  return (
                    <Card key={uniqueKey} className="border">
                    <CardContent className="p-2 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-4">
                        {/* Icon */}
                        <div className="mt-0.5 sm:mt-1">
                          {getTransactionIcon(txn)}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 sm:gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">
                                {txn.description}
                              </p>
                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                                  {txn.type}
                                </Badge>
                                <Badge 
                                  variant={txn.status === "COMPLETED" ? "default" : "secondary"}
                                  className="text-[10px] sm:text-xs px-1 sm:px-2 py-0"
                                >
                                  {txn.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-bold text-sm sm:text-lg ${getTransactionColor(txn)}`}>
                                {formatTransactionAmount(txn)}
                              </p>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="mt-1.5 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground space-y-0.5 sm:space-y-1">
                            <div className="flex justify-between gap-1">
                              <span className="text-[10px] sm:text-xs">ID:</span>
                              <span className="font-mono text-[9px] sm:text-xs truncate">{txn.transactionId}</span>
                            </div>
                            <div className="flex justify-between gap-1">
                              <span className="text-[10px] sm:text-xs">Date:</span>
                              <span className="text-[10px] sm:text-xs">{format(new Date(txn.date), "MMM dd, yy 'at' h:mm a")}</span>
                            </div>
                            <div className="flex justify-between gap-1">
                              <span className="text-[10px] sm:text-xs">Balance:</span>
                              <span className="font-medium text-[10px] sm:text-xs">{formatCurrency(parseFloat(txn.balanceAfter))}</span>
                            </div>
                            {txn.senderAccountNumber && (
                              <div className="flex justify-between gap-1">
                                <span className="text-[10px] sm:text-xs">From:</span>
                                <span className="font-mono text-[9px] sm:text-xs truncate">{txn.senderAccountNumber}</span>
                              </div>
                            )}
                            {txn.recipientAccountNumber && (
                              <div className="flex justify-between gap-1">
                                <span className="text-[10px] sm:text-xs">To:</span>
                                <span className="font-mono text-[9px] sm:text-xs truncate">{txn.recipientAccountNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
