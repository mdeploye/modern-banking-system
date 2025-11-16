"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CustomerData {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  landline: string | null
  dateOfBirth: string
  gender: string
  ssn: string
  driversLicense: string
  citizenship: string
  homeAddress: string
  officeAddress: string | null
  city: string
  state: string
  zipCode: string
  areaLocality: string
  country: string
}

export default function EditCustomerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    landline: "",
    dateOfBirth: "",
    homeAddress: "",
    officeAddress: "",
    city: "",
    state: "",
    zipCode: "",
    areaLocality: "",
    citizenship: "",
  })

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchCustomer()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router, customerId])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
        // Initialize form
        setEditForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          mobile: data.mobile || "",
          landline: data.landline || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          homeAddress: data.homeAddress || "",
          officeAddress: data.officeAddress || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          areaLocality: data.areaLocality || "",
          citizenship: data.citizenship || "",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        })
        router.push("/admin/customers")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      })
      router.push("/admin/customers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/customers/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          ...editForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer updated successfully",
        })
        router.push("/admin/customers")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN" || !customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Customer</h1>
          <p className="text-muted-foreground mt-1">
            Customer #{customer.customerNumber} - {customer.firstName} {customer.lastName}
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update customer's personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="text-sm font-medium mt-2">{customer.gender}</p>
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="citizenship">Citizenship</Label>
                  <Input
                    id="citizenship"
                    value={editForm.citizenship}
                    onChange={(e) => setEditForm({ ...editForm, citizenship: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer Number</Label>
                  <p className="text-sm font-medium mt-2">{customer.customerNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    placeholder="5551234567"
                  />
                </div>
                <div>
                  <Label htmlFor="landline">Landline (Optional)</Label>
                  <Input
                    id="landline"
                    value={editForm.landline}
                    onChange={(e) => setEditForm({ ...editForm, landline: e.target.value })}
                    placeholder="5551234567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="homeAddress">Home Address</Label>
                <Input
                  id="homeAddress"
                  value={editForm.homeAddress}
                  onChange={(e) => setEditForm({ ...editForm, homeAddress: e.target.value })}
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>
              <div>
                <Label htmlFor="officeAddress">Office Address (Optional)</Label>
                <Input
                  id="officeAddress"
                  value={editForm.officeAddress}
                  onChange={(e) => setEditForm({ ...editForm, officeAddress: e.target.value })}
                  placeholder="456 Business Ave, Suite 100"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="Los Angeles"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    placeholder="CA"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={editForm.zipCode}
                    onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="90001"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="areaLocality">Area/Locality</Label>
                  <Input
                    id="areaLocality"
                    value={editForm.areaLocality}
                    onChange={(e) => setEditForm({ ...editForm, areaLocality: e.target.value })}
                    placeholder="Downtown"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Country</Label>
                  <p className="text-sm font-medium mt-2">{customer.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Non-editable Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Identity Documents</CardTitle>
              <CardDescription>These fields cannot be edited</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">SSN</Label>
                  <p className="text-sm font-medium mt-2">XXX-XX-{customer.ssn.slice(-4)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Driver's License</Label>
                  <p className="text-sm font-medium mt-2">{customer.driversLicense}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/admin/customers" className="flex-1">
              <Button variant="outline" className="w-full" disabled={isSaving}>
                Cancel
              </Button>
            </Link>
            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
