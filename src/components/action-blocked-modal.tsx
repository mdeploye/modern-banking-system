"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Phone, Mail, AlertTriangle } from "lucide-react"

interface ActionBlockedModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: string // e.g., "transfer", "withdrawal"
  restrictionType: string | null | undefined
  restrictionReason: string | null | undefined
}

const actionMessages: Record<string, string> = {
  transfer: "Fund transfers are currently blocked on your account.",
  withdrawal: "Withdrawals are currently restricted on your account.",
  deposit: "Deposits are currently not allowed on your account.",
  default: "This action is currently not allowed on your account.",
}

export function ActionBlockedModal({
  isOpen,
  onClose,
  actionType,
  restrictionType,
  restrictionReason,
}: ActionBlockedModalProps) {
  if (!isOpen) return null

  const message = actionMessages[actionType] || actionMessages.default

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 shadow-2xl">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Action Blocked</CardTitle>
                <CardDescription className="text-red-700">
                  Account restriction in effect
                </CardDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Main Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">{message}</p>
                {restrictionReason && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs font-semibold text-red-800 mb-1">Reason:</p>
                    <p className="text-sm text-red-700">{restrictionReason}</p>
                  </div>
                )}
                {restrictionType && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600">
                      Restriction Type: <span className="font-medium">{restrictionType}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* What You Can Do */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">What you can do:</p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Contact our support team for assistance</li>
              <li>View your transaction history</li>
              <li>Check your account balance</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-foreground">Need immediate help?</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+1234567890"
                className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">Call Us</span>
              </a>
              <a
                href="mailto:support@canvas.org"
                className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">Email</span>
              </a>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This restriction was applied by our administration team for your account security.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
