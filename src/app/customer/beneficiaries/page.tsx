"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Beneficiaries() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Link href="/customer/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Beneficiaries</CardTitle>
            <CardDescription>Add and manage your beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Beneficiaries page - Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
