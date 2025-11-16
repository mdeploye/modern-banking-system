"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SendMoneyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  const [formData, setFormData] = useState({
    toAccountNumber: "",
    amount: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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
        toast({
          title: "Transfer Successful!",
          description: `$${formData.amount} sent to ${formData.toAccountNumber}`,
        })
      } else {
        toast({
          title: "Transfer Failed",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transfer",
        variant: "destructive",
      })
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
    router.push("/login")
    return null
  }

  if (success && transactionDetails) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/customer/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your money has been sent successfully
              </p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-left">
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
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">New Balance:</span>
                  <span className="font-bold text-lg text-green-600">
                    ${transactionDetails.newBalance.toFixed(2)}
                  </span>
                </div>
              </div>

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
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/customer/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Send Money</CardTitle>
            <CardDescription>Transfer funds to another account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toAccountNumber">Recipient Account Number *</Label>
                <Input
                  id="toAccountNumber"
                  type="text"
                  placeholder="1000000002"
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
                  placeholder="Payment for services"
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
  )
}
