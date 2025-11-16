"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { CanvasLogo } from "@/components/canvas-logo"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customerForm, setCustomerForm] = useState({ email: "", password: "" })
  const [adminForm, setAdminForm] = useState({ email: "", password: "" })

  const handleLogin = async (role: "CUSTOMER" | "ADMIN") => {
    setIsLoading(true)
    const form = role === "CUSTOMER" ? customerForm : adminForm

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        role: role,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        })
        
        // Redirect based on role
        if (role === "CUSTOMER") {
          router.push("/customer/dashboard")
        } else {
          router.push("/admin/dashboard")
        }
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <CanvasLogo size="md" showText={true} />
        </div>

        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Customer Login */}
          <TabsContent value="customer">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleLogin("CUSTOMER")
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="Email Address"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="Password"
                      value={customerForm.password}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, password: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 accent-primary" />
                    <label htmlFor="remember" className="text-sm text-foreground">Remember Me</label>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </form>

                <div className="mt-4 text-center space-y-2">
                  <Link href="/forgot-password" className="text-sm text-secondary hover:underline block">
                    Forgot Username or Password?
                  </Link>
                  <Link href="/register" className="text-sm text-secondary hover:underline block">
                    Create a New Account
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Login */}
          <TabsContent value="admin">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleLogin("ADMIN")
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Email Address"
                      value={adminForm.email}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Password"
                      value={adminForm.password}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, password: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember-admin" className="w-4 h-4 accent-primary" />
                    <label htmlFor="remember-admin" className="text-sm text-foreground">Remember Me</label>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
