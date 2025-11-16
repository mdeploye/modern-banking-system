import { z } from "zod"

// Customer Registration Schema
export const customerRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date)
    const age = new Date().getFullYear() - dob.getFullYear()
    return age >= 18 && age <= 100
  }, "You must be at least 18 years old"),
  
  // Contact
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
  landline: z.string().optional(),
  
  // Identification
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
  aadhaar: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
  citizenship: z.string().min(2, "Citizenship is required"),
  
  // Address
  homeAddress: z.string().min(10, "Home address must be at least 10 characters"),
  officeAddress: z.string().optional(),
  country: z.string().default("India"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pinCode: z.string().regex(/^\d{6}$/, "Invalid PIN code"),
  areaLocality: z.string().min(2, "Area/Locality is required"),
  
  // Nominee (optional)
  nomineeName: z.string().optional(),
  nomineeAccount: z.string().optional(),
  
  // Account
  accountType: z.enum(["SAVING", "CURRENT"]),
  
  // Password
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Staff Login Schema
export const staffLoginSchema = z.object({
  staffNumber: z.string().min(1, "Staff number is required"),
  password: z.string().min(1, "Password is required"),
})

// Debit Card Application Schema
export const debitCardApplicationSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  holderName: z.string().min(2, "Account holder name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
})

// Beneficiary Schema
export const beneficiarySchema = z.object({
  name: z.string().min(2, "Beneficiary name must be at least 2 characters"),
  accountNumber: z.string().min(10, "Invalid account number"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountType: z.enum(["SAVING", "CURRENT"]),
})

// Fund Transfer Schema
export const fundTransferSchema = z.object({
  beneficiaryId: z.string().min(1, "Please select a beneficiary"),
  amount: z.number().min(1, "Amount must be at least ₹1").max(100000, "Amount cannot exceed ₹100,000 per transaction"),
  remark: z.string().optional(),
})

// OTP Verification Schema
export const otpVerificationSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Account Approval Schema
export const accountApprovalSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
})

// Credit Account Schema
export const creditAccountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  amount: z.number().min(1, "Amount must be at least ₹1"),
  remark: z.string().optional(),
})

// Delete Account Schema
export const deleteAccountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
})
