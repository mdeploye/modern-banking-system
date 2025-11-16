import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: z.enum(["SAVING", "CURRENT"]).optional(), // Optional - we create both accounts automatically
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { errorMap: () => ({ message: "Please select a valid gender" }) }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  mobile: z.string().min(10, "Phone number must be at least 10 digits"),
  landline: z.string().optional().or(z.literal("")),
  ssn: z.string().length(9, "SSN must be exactly 9 digits"),
  driversLicense: z.string().min(5, "Driver's License is required").max(20, "Driver's License is too long"),
  citizenship: z.string().default("US Citizen"),
  homeAddress: z.string().min(1, "Home address is required"),
  officeAddress: z.string().optional().or(z.literal("")),
  country: z.string().default("United States"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits"),
  areaLocality: z.string().min(1, "Area/Locality is required"),
  nomineeName: z.string().optional().or(z.literal("")),
  nomineeAccount: z.string().optional().or(z.literal("")),
})

// Helper to generate unique account numbers (US Standard Format)
// Format: 10-digit account number (US banking standard)
async function generateAccountNumber(): Promise<string> {
  // Get the last account number from database
  const lastAccount = await prisma.account.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { accountNumber: true }
  })
  
  // ALWAYS start with 702346799 as the base sequence if no accounts exist
  let sequence = 702346799
  
  // Log the found account for debugging
  console.log('Last account found:', lastAccount)
  
  if (lastAccount) {
    // Parse the account number and increment
    const lastSequence = parseInt(lastAccount.accountNumber)
    sequence = lastSequence + 1
    console.log('Incrementing from last account number:', lastSequence, 'to', sequence)
  } else {
    console.log('No existing accounts found, using starting sequence:', sequence)
  }
  
  // Format: 10-digit number
  const result = sequence.toString()
  console.log('Generated account number:', result)
  return result
}

// Generate sequential customer numbers
async function generateCustomerNumber(): Promise<string> {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { customerNumber: true }
  })
  
  let sequence = 35672904 // Starting from 35.6M customers (roughly half of account number since each customer gets 2 accounts)
  if (lastCustomer) {
    // Extract number after CUST prefix
    const lastSequence = parseInt(lastCustomer.customerNumber.replace('CUST', ''))
    sequence = lastSequence + 1
  }
  
  // Format: CUST + 10 digits = CUST0035672904
  return `CUST${sequence.toString().padStart(10, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate with detailed error messages
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      const fieldErrors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: "Validation failed",
          fields: fieldErrors,
          message: fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }
    
    const data = validation.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Check if mobile already exists
    const existingMobile = await prisma.customer.findUnique({
      where: { mobile: data.mobile },
    })

    if (existingMobile) {
      return NextResponse.json(
        { error: "Mobile number already registered" },
        { status: 400 }
      )
    }

    // Check if SSN already exists
    const existingSSN = await prisma.customer.findUnique({
      where: { ssn: data.ssn },
    })

    if (existingSSN) {
      return NextResponse.json(
        { error: "SSN already registered" },
        { status: 400 }
      )
    }

    // Check if Driver's License already exists
    const existingLicense = await prisma.customer.findUnique({
      where: { driversLicense: data.driversLicense },
    })

    if (existingLicense) {
      return NextResponse.json(
        { error: "Driver's License already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Generate account and customer numbers BEFORE transaction
    // Find the last created account to continue the sequence from there
    const lastAccount = await prisma.account.findFirst({
      orderBy: { createdAt: "desc" },
      select: { accountNumber: true },
    })

    let baseSequence = 702346799
    if (lastAccount?.accountNumber) {
      const lastSequence = parseInt(lastAccount.accountNumber)
      if (!Number.isNaN(lastSequence)) {
        baseSequence = lastSequence + 1
      }
    }

    const checkingAccountNumber = baseSequence.toString()
    const savingsAccountNumber = (baseSequence + 1).toString()

    console.log("Creating accounts with numbers:", checkingAccountNumber, "and", savingsAccountNumber)

    const customerNumber = await generateCustomerNumber()

    // Create user and customer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: "CUSTOMER",
        },
      })

      // Create customer
      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(data.dateOfBirth),
          mobile: data.mobile,
          landline: data.landline,
          ssn: data.ssn,
          driversLicense: data.driversLicense,
          citizenship: data.citizenship,
          homeAddress: data.homeAddress,
          officeAddress: data.officeAddress,
          country: data.country,
          state: data.state,
          city: data.city,
          zipCode: data.zipCode,
          areaLocality: data.areaLocality,
          nomineeName: data.nomineeName,
          nomineeAccount: data.nomineeAccount,
          customerNumber: customerNumber,
        },
      })

      console.log('About to create checking account with number:', checkingAccountNumber)
      
      // Create CHECKING account (pending approval)
      const checkingAccount = await tx.account.create({
        data: {
          customerId: customer.id,
          accountNumber: checkingAccountNumber,
          accountType: "CURRENT", // Checking = Current account
          status: "PENDING",
          balance: 0,
        },
      })
      
      console.log('Created checking account:', checkingAccount)

      console.log('About to create savings account with number:', savingsAccountNumber)
      
      // Create SAVINGS account (pending approval)
      const savingsAccount = await tx.account.create({
        data: {
          customerId: customer.id,
          accountNumber: savingsAccountNumber,
          accountType: "SAVING",
          status: "PENDING",
          balance: 0,
        },
      })
      
      console.log('Created savings account:', savingsAccount)

      // Create audit log
      await tx.auditLog.create({
        data: {
          customerId: customer.id,
          action: "CUSTOMER_REGISTRATION",
          entity: "CUSTOMER",
          entityId: customer.id,
          details: JSON.stringify({
            email: data.email,
            checkingAccount: checkingAccountNumber,
            savingsAccount: savingsAccountNumber,
          }),
        },
      })

      return { user, customer, checkingAccount, savingsAccount }
    })

    return NextResponse.json(
      {
        message: "Registration successful. Your accounts are pending approval.",
        customerNumber: result.customer.customerNumber,
        checkingAccountNumber: result.checkingAccount.accountNumber,
        savingsAccountNumber: result.savingsAccount.accountNumber,
      },
      { status: 201 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again."
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
