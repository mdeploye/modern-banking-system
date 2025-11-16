"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomerNav } from "@/components/customer-nav"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, CreditCard, Calendar, Lock, Loader2, CheckCircle2, AlertCircle, Edit, Save, X } from "lucide-react"
import { format } from "date-fns"

interface ProfileData {
  email: string
  firstName: string
  lastName: string
  customerNumber: string
  mobile: string
  landline: string | null
  gender: string
  dateOfBirth: string
  ssn: string
  driversLicense: string
  citizenship: string
  homeAddress: string
  officeAddress: string | null
  country: string
  state: string
  city: string
  zipCode: string
  areaLocality: string
  nomineeName: string | null
  nomineeAccount: string | null
  accounts: Array<{
    accountNumber: string
    accountType: string
    status: string
    balance: string
  }>
  createdAt: string
}

export default function CustomerProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  
  // Edit profile state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    landline: "",
    homeAddress: "",
    officeAddress: "",
    city: "",
    state: "",
    zipCode: "",
    areaLocality: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "CUSTOMER") {
      fetchProfile()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/customer/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        // Initialize edit form with current data
        setEditForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          mobile: data.mobile || "",
          landline: data.landline || "",
          homeAddress: data.homeAddress || "",
          officeAddress: data.officeAddress || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          areaLocality: data.areaLocality || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProfile = async () => {
    setEditError("")
    setEditSuccess(false)
    setIsSaving(true)

    try {
      const response = await fetch("/api/customer/profile/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (response.ok) {
        setEditSuccess(true)
        setIsEditing(false)
        fetchProfile() // Refresh profile data
        setTimeout(() => setEditSuccess(false), 3000)
      } else {
        setEditError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setEditError("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditError("")
    // Reset form to current profile data
    if (profile) {
      setEditForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        mobile: profile.mobile || "",
        landline: profile.landline || "",
        homeAddress: profile.homeAddress || "",
        officeAddress: profile.officeAddress || "",
        city: profile.city || "",
        state: profile.state || "",
        zipCode: profile.zipCode || "",
        areaLocality: profile.areaLocality || "",
      })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess(true)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess(false)
        }, 2000)
      } else {
        setPasswordError(data.error || "Failed to change password")
      }
    } catch (error) {
      setPasswordError("An error occurred")
    } finally {
      setPasswordLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || session.user.role !== "CUSTOMER" || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerNav />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your account information</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleEditProfile} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {editSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            Profile updated successfully!
          </div>
        )}
        {editError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            {editError}
          </div>
        )}

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Customer Number</Label>
                <p className="font-medium">{profile.customerNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="font-medium">{format(new Date(profile.createdAt), "MMMM dd, yyyy")}</p>
              </div>
              <div>
                <Label>First Name</Label>
                {isEditing ? (
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{profile.firstName}</p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                {isEditing ? (
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{profile.lastName}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium">{profile.gender}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{format(new Date(profile.dateOfBirth), "MMMM dd, yyyy")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Citizenship</Label>
                <p className="font-medium">{profile.citizenship}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium text-sm">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Contact admin to change email</p>
              </div>
              <div>
                <Label>Mobile</Label>
                {isEditing ? (
                  <Input
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    placeholder="5551234567"
                  />
                ) : (
                  <p className="font-medium">{profile.mobile}</p>
                )}
              </div>
              <div>
                <Label>Landline {!isEditing && "(Optional)"}</Label>
                {isEditing ? (
                  <Input
                    value={editForm.landline}
                    onChange={(e) => setEditForm({ ...editForm, landline: e.target.value })}
                    placeholder="5551234567"
                  />
                ) : (
                  <p className="font-medium">{profile.landline || "Not provided"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Home Address</Label>
                {isEditing ? (
                  <Input
                    value={editForm.homeAddress}
                    onChange={(e) => setEditForm({ ...editForm, homeAddress: e.target.value })}
                    placeholder="123 Main Street, Apt 4B"
                  />
                ) : (
                  <p className="font-medium">{profile.homeAddress}</p>
                )}
              </div>
              <div>
                <Label>Office Address {!isEditing && "(Optional)"}</Label>
                {isEditing ? (
                  <Input
                    value={editForm.officeAddress}
                    onChange={(e) => setEditForm({ ...editForm, officeAddress: e.target.value })}
                    placeholder="456 Business Ave, Suite 100"
                  />
                ) : (
                  <p className="font-medium">{profile.officeAddress || "Not provided"}</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="Los Angeles"
                    />
                  ) : (
                    <p className="font-medium">{profile.city}</p>
                  )}
                </div>
                <div>
                  <Label>State</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      placeholder="CA"
                    />
                  ) : (
                    <p className="font-medium">{profile.state}</p>
                  )}
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.zipCode}
                      onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="90001"
                      maxLength={5}
                    />
                  ) : (
                    <p className="font-medium">{profile.zipCode}</p>
                  )}
                </div>
                <div>
                  <Label>Area/Locality</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.areaLocality}
                      onChange={(e) => setEditForm({ ...editForm, areaLocality: e.target.value })}
                      placeholder="Downtown"
                    />
                  ) : (
                    <p className="font-medium">{profile.areaLocality}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Country</Label>
                  <p className="font-medium">{profile.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Identity Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">SSN</Label>
                <p className="font-mono font-medium">XXX-XX-{profile.ssn.slice(-4)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Driver's License</Label>
                <p className="font-mono font-medium">{profile.driversLicense}</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>My Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.accounts.map((account, index) => {
                // Use a combination of index, account type and a random string for completely unique keys
                const uniqueAccountKey = `account-${index}-${account.accountType}-${Math.random().toString(36).substring(2, 9)}`;
                return (
                <div key={uniqueAccountKey} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {account.accountType === "CURRENT" ? "Checking Account" : "Savings Account"}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">{account.accountNumber}</p>
                  </div>
                  <Badge variant={account.status === "ACTIVE" ? "default" : "secondary"}>
                    {account.status}
                  </Badge>
                </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Nominee Information */}
          {profile.nomineeName && (
            <Card>
              <CardHeader>
                <CardTitle>Nominee Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nominee Name</Label>
                  <p className="font-medium">{profile.nomineeName}</p>
                </div>
                {profile.nomineeAccount && (
                  <div>
                    <Label className="text-muted-foreground">Nominee Account</Label>
                    <p className="font-mono font-medium">{profile.nomineeAccount}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="font-medium text-green-600">Password changed successfully!</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={passwordLoading} className="flex-1">
                      {passwordLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...</>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordModal(false)
                        setPasswordError("")
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
                      }}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
