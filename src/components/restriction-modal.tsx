"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, X, Phone, Mail } from "lucide-react"

interface RestrictionModalProps {
  restrictionType: string | null | undefined
  restrictionReason: string | null | undefined
  onClose?: () => void
}

const restrictionMessages: Record<string, { title: string; description: string; icon: string }> = {
  WITHDRAWAL_LIMIT: {
    title: "Withdrawal Limit Applied",
    description: "Your account has a temporary withdrawal limit. You can still view your balance and receive deposits.",
    icon: "⚠️"
  },
  TRANSFER_BLOCKED: {
    title: "Transfers Temporarily Blocked",
    description: "Fund transfers from your account are currently blocked. All other services remain available.",
    icon: "🚫"
  },
  FROZEN: {
    title: "Account Frozen",
    description: "Your account has been temporarily frozen. You cannot perform any transactions at this time.",
    icon: "❄️"
  },
  PENDING_VERIFICATION: {
    title: "Additional Verification Required",
    description: "We need additional information to verify your identity. Some features may be limited.",
    icon: "🔍"
  },
  SUSPICIOUS_ACTIVITY: {
    title: "Account Under Review",
    description: "We've detected unusual activity and have temporarily restricted your account for security.",
    icon: "🔒"
  },
  DEFAULT: {
    title: "Account Restricted",
    description: "Your account has restrictions applied. Please contact support for details.",
    icon: "⚠️"
  }
}

export function RestrictionModal({ restrictionType, restrictionReason, onClose }: RestrictionModalProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  const restriction = restrictionMessages[restrictionType || "DEFAULT"] || restrictionMessages.DEFAULT

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-orange-200 shadow-2xl">
        <CardHeader className="bg-orange-50 border-b border-orange-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-orange-900">{restriction.title}</CardTitle>
                <CardDescription className="text-orange-700">Account restriction notice</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          {/* Main Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900 mb-2">{restriction.description}</p>
            {restrictionReason && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-xs font-semibold text-orange-800 mb-1">Reason:</p>
                <p className="text-sm text-orange-700">{restrictionReason}</p>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Need help?</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+1234567890"
                className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">Call Support</span>
              </a>
              <a
                href="mailto:support@canvas.org"
                className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">Email Us</span>
              </a>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <label htmlFor="acknowledge" className="text-sm text-muted-foreground cursor-pointer">
              I understand that my account has restrictions and will contact support if needed.
            </label>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            disabled={!acknowledged}
            className="w-full h-12 rounded-xl font-semibold"
          >
            Continue to Dashboard
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            For security purposes, this restriction was applied by our administration team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
