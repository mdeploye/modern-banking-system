"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CanvasLogo } from "@/components/canvas-logo"
import { 
  Menu, 
  X, 
  Home,
  Send,
  History,
  User,
  LogOut 
} from "lucide-react"

export function CustomerNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/customer/dashboard" className="flex items-center gap-2">
          <CanvasLogo className="h-8 w-8" />
          <span className="font-bold text-xl hidden sm:inline">Canvas Credit Union</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/customer/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/customer/transfer">
            <Button variant="ghost" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </Link>
          <Link href="/customer/transactions">
            <Button variant="ghost" size="sm">
              <History className="mr-2 h-4 w-4" />
              Transactions
            </Button>
          </Link>
          <Link href="/customer/profile">
            <Button variant="ghost" size="sm">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 top-[57px] bg-background z-50 md:hidden">
            <nav className="flex flex-col p-4 gap-2">
              <Link href="/customer/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/customer/transfer" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <Send className="mr-3 h-5 w-5" />
                  Transfer
                </Button>
              </Link>
              <Link href="/customer/transactions" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <History className="mr-3 h-5 w-5" />
                  Transactions
                </Button>
              </Link>
              <Link href="/customer/profile" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start mt-4"
                size="lg"
                onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
