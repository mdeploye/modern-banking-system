import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique IDs
export function generateAccountNumber(): string {
  // Use 702346799 as starting point as requested
  return "702346799"
}

export function generateCustomerNumber(): string {
  const prefix = "CUST"
  const random = Math.floor(Math.random() * 9000000) + 1000000 // 7 digits
  return `${prefix}${random}`
}

export function generateStaffNumber(): string {
  const prefix = "STF"
  const random = Math.floor(Math.random() * 90000) + 10000 // 5 digits
  return `${prefix}${random}`
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 900000) + 100000 // 6 digits
  return `TXN${timestamp}${random}`
}

export function generateDebitCardNumber(): string {
  // Format: 4213 XXXX XXXX XXXX
  const bin = "4213"
  const random = Math.floor(Math.random() * 900000000000) + 100000000000 // 12 digits
  return `${bin}${random}`
}

export function generateCardPin(): string {
  return Math.floor(Math.random() * 9000 + 1000).toString() // 4 digits
}

export function generateCVV(): string {
  return Math.floor(Math.random() * 900 + 100).toString() // 3 digits
}

export function generateOTP(): string {
  return Math.floor(Math.random() * 900000 + 100000).toString() // 6 digits
}

// Format currency
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num)
}

// Format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

// Mask account number
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber
  return `XXXX ${accountNumber.slice(-4)}`
}

// Mask card number
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length !== 16) return cardNumber
  return `${cardNumber.slice(0, 4)} XXXX XXXX ${cardNumber.slice(-4)}`
}

// Mask mobile number
export function maskMobileNumber(mobile: string): string {
  if (mobile.length !== 10) return mobile
  return `${mobile.slice(0, 3)}XXXXX${mobile.slice(-2)}`
}

// Validate mobile number
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile)
}

// Validate PAN
export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
}

// Validate Aadhaar
export function isValidAadhaar(aadhaar: string): boolean {
  return /^\d{12}$/.test(aadhaar)
}

// Validate IFSC
export function isValidIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)
}
