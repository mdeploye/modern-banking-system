"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Building2, DollarSign, Users, Shield, Mail, Bell, Lock } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure system preferences and view settings</p>
        </div>

        <div className="grid gap-6">
          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">Canvas Credit Union</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Routing Number</p>
                  <p className="font-mono font-medium">302 075 830</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Swift Code</p>
                  <p className="font-mono font-medium">CANVUS33XXX</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Code</p>
                  <p className="font-mono font-medium">CCU001</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Auto-approve transactions</p>
                  <p className="text-sm text-muted-foreground">Transactions below limit are auto-approved</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Auto-approval limit</p>
                  <p className="text-sm text-muted-foreground">Maximum amount for auto-approval</p>
                </div>
                <p className="font-mono font-medium">$10,000</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Daily transaction limit</p>
                  <p className="text-sm text-muted-foreground">Per customer per day</p>
                </div>
                <p className="font-mono font-medium">$50,000</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Transaction fee</p>
                  <p className="text-sm text-muted-foreground">Standard transfer fee</p>
                </div>
                <p className="font-mono font-medium">$0.00</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Dual account system</p>
                  <p className="text-sm text-muted-foreground">Auto-create checking and savings accounts</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Account approval required</p>
                  <p className="text-sm text-muted-foreground">New accounts need admin approval</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Minimum opening balance</p>
                  <p className="text-sm text-muted-foreground">Required balance to open account</p>
                </div>
                <p className="font-mono font-medium">$0.00</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admins</p>
                </div>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Session timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <p className="font-mono font-medium">30 minutes</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Password policy</p>
                  <p className="text-sm text-muted-foreground">Minimum password length</p>
                </div>
                <p className="font-mono font-medium">8 characters</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Audit logging</p>
                  <p className="text-sm text-muted-foreground">Track all admin actions</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Send email for important events</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Transaction alerts</p>
                  <p className="text-sm text-muted-foreground">Alert for large transactions</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">New registration alerts</p>
                  <p className="text-sm text-muted-foreground">Notify admins of new registrations</p>
                </div>
                <Badge>Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SMTP Server</p>
                  <p className="font-mono font-medium">smtp.canvascu.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SMTP Port</p>
                  <p className="font-mono font-medium">587</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From Email</p>
                  <p className="font-mono font-medium">noreply@canvascu.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Configuration Locked</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    These settings are read-only and can only be modified through environment variables or database configuration.
                    Contact system administrator to update these values.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
