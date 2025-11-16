"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Phone, Mail, ChevronDown, ChevronUp, Lock, Shield } from "lucide-react"

interface RestrictedAccountBannerProps {
  restrictionType: string | null | undefined
  restrictionReason: string | null | undefined
  restrictedAt?: string | null
}

const restrictionConfig: Record<string, { 
  title: string
  color: string
  bgColor: string
  borderColor: string
  icon: any
}> = {
  FROZEN: {
    title: "Account Frozen",
    color: "text-red-900",
    bgColor: "bg-red-500",
    borderColor: "border-red-600",
    icon: Lock,
  },
  TRANSFER_BLOCKED: {
    title: "Transfers Blocked",
    color: "text-orange-900",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-600",
    icon: Shield,
  },
  WITHDRAWAL_LIMIT: {
    title: "Withdrawal Limit Applied",
    color: "text-yellow-900",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-600",
    icon: AlertTriangle,
  },
  PENDING_VERIFICATION: {
    title: "Verification Required",
    color: "text-blue-900",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-600",
    icon: Shield,
  },
  SUSPICIOUS_ACTIVITY: {
    title: "Account Under Review",
    color: "text-purple-900",
    bgColor: "bg-purple-500",
    borderColor: "border-purple-600",
    icon: Lock,
  },
}

export function RestrictedAccountBanner({ 
  restrictionType, 
  restrictionReason,
  restrictedAt 
}: RestrictedAccountBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const config = restrictionConfig[restrictionType || ""] || restrictionConfig.FROZEN
  const Icon = config.icon

  if (isMinimized) {
    return (
      <div 
        className={`${config.bgColor} text-white px-4 py-2 cursor-pointer`}
        onClick={() => setIsMinimized(false)}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">Account Restricted</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    )
  }

  return (
    <div className={`${config.bgColor} text-white shadow-lg sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{config.title}</h3>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-white/90 mt-0.5">
                {restrictionReason || "Your account has been restricted. Please contact support."}
              </p>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="text-xs">
                      <span className="text-white/70">Type:</span>
                      <span className="ml-2 font-medium">{restrictionType}</span>
                    </div>
                    {restrictedAt && (
                      <div className="text-xs">
                        <span className="text-white/70">Applied:</span>
                        <span className="ml-2 font-medium">
                          {new Date(restrictedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a
                      href="tel:+1234567890"
                      className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call Support
                    </a>
                    <a
                      href="mailto:support@canvas.org"
                      className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email Us
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:flex"
            >
              {isExpanded ? "Less Info" : "View Details"}
            </Button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/80 hover:text-white p-1 transition-colors"
              aria-label="Minimize banner"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
