"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle2 } from "lucide-react"
import { CanvasLogo } from "@/components/canvas-logo"
import { toast } from "@/hooks/use-toast"

type Step = 1 | 2 | 3 | 4

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Account Info
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "SAVING",

    // Step 2: Personal Info
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    mobile: "",
    landline: "",

    // Step 3: Identification (US Standard)
    ssn: "",
    driversLicense: "",
    citizenship: "US Citizen",

    // Step 4: Address (US Standard)
    homeAddress: "",
    officeAddress: "",
    country: "United States",
    state: "",
    city: "",
    zipCode: "",
    areaLocality: "",

    // Nominee (optional)
    nomineeName: "",
    nomineeAccount: "",
  })

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.gender) {
      toast({
        title: "Error",
        description: "Please select your gender",
        variant: "destructive",
      })
      setCurrentStep(2) // Go back to personal info step
      return
    }

    if (formData.mobile.length < 10) {
      toast({
        title: "Error",
        description: "Phone number must be at least 10 digits",
        variant: "destructive",
      })
      setCurrentStep(2)
      return
    }

    if (formData.ssn.length !== 9) {
      toast({
        title: "Error",
        description: "SSN must be exactly 9 digits",
        variant: "destructive",
      })
      setCurrentStep(3)
      return
    }

    if (formData.driversLicense.length < 5) {
      toast({
        title: "Error",
        description: "Driver's License is required",
        variant: "destructive",
      })
      setCurrentStep(3)
      return
    }

    if (formData.zipCode.length !== 5) {
      toast({
        title: "Error",
        description: "ZIP code must be exactly 5 digits",
        variant: "destructive",
      })
      setCurrentStep(4)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Pass the data to the error for detailed field errors
        const err: any = new Error(data.error || "Registration failed")
        err.data = data
        throw err
      }

      setIsSuccess(true)
      toast({
        title: "Registration Successful!",
        description: "Your account has been created and is pending approval.",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please try again."
      const errorData = error.data
      
      // Show detailed field errors if available
      if (errorData?.fields && Array.isArray(errorData.fields)) {
        const fieldErrors = errorData.fields.map((f: any) => `• ${f.field}: ${f.message}`).join('\n')
        toast({
          title: "Validation Failed",
          description: fieldErrors,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registration Failed",
          description: errorData?.message || errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as Step)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Registration Successful!</CardTitle>
            <CardDescription>
              Your account has been created successfully and is pending admin approval.
              You will be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Canvas Logo */}
        <div className="flex justify-center mb-10">
          <CanvasLogo size="md" showText={true} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Account</CardTitle>
            <CardDescription>
              Step {currentStep} of 4: Complete all steps to create your account
            </CardDescription>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateForm("confirmPassword", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => updateForm("accountType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVING">Savings Account</SelectItem>
                      <SelectItem value="CURRENT">Current Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateForm("firstName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateForm("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateForm("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateForm("dateOfBirth", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.mobile}
                      onChange={(e) => updateForm("mobile", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landline">Landline</Label>
                    <Input
                      id="landline"
                      type="tel"
                      placeholder="(555) 987-6543"
                      value={formData.landline}
                      onChange={(e) => updateForm("landline", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Identification */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identification Documents</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="ssn">Social Security Number (SSN) *</Label>
                  <Input
                    id="ssn"
                    placeholder="123456789 (9 digits, no dashes)"
                    value={formData.ssn}
                    onChange={(e) => updateForm("ssn", e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter 9 digits only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driversLicense">Driver's License Number *</Label>
                  <Input
                    id="driversLicense"
                    placeholder="D1234567"
                    value={formData.driversLicense}
                    onChange={(e) => updateForm("driversLicense", e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizenship">Citizenship *</Label>
                  <Input
                    id="citizenship"
                    placeholder="US Citizen"
                    value={formData.citizenship}
                    onChange={(e) => updateForm("citizenship", e.target.value)}
                    required
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Nominee Details (Optional)</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nomineeName">Nominee Name</Label>
                    <Input
                      id="nomineeName"
                      value={formData.nomineeName}
                      onChange={(e) => updateForm("nomineeName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mt-2">
                    <Label htmlFor="nomineeAccount">Nominee Account Number</Label>
                    <Input
                      id="nomineeAccount"
                      value={formData.nomineeAccount}
                      onChange={(e) => updateForm("nomineeAccount", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Address */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="homeAddress">Home Address *</Label>
                  <Input
                    id="homeAddress"
                    placeholder="123 Main Street"
                    value={formData.homeAddress}
                    onChange={(e) => updateForm("homeAddress", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Input
                    id="officeAddress"
                    placeholder="456 Business Blvd"
                    value={formData.officeAddress}
                    onChange={(e) => updateForm("officeAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Los Angeles"
                      value={formData.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={formData.state}
                      onChange={(e) => updateForm("state", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      placeholder="90001"
                      value={formData.zipCode}
                      onChange={(e) => updateForm("zipCode", e.target.value.replace(/\D/g, ''))}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaLocality">County *</Label>
                    <Input
                      id="areaLocality"
                      placeholder="Los Angeles County"
                      value={formData.areaLocality}
                      onChange={(e) => updateForm("areaLocality", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-sm text-primary hover:underline">
            Login here
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
