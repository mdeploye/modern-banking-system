import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Decimal } from '@prisma/client/runtime/library'

// Luxury transaction types (same as script)
const luxuryTransactions = {
  income: [
    { description: 'Stock Trading Profit - Tesla', min: 50000, max: 250000 },
    { description: 'Cryptocurrency Gain - Bitcoin', min: 80000, max: 400000 },
    { description: 'Dividend Payment - Apple Inc', min: 15000, max: 45000 },
    { description: 'Real Estate Rental Income - Manhattan', min: 25000, max: 60000 },
    { description: 'Stock Trading Profit - NVIDIA', min: 60000, max: 300000 },
    { description: 'Cryptocurrency Gain - Ethereum', min: 40000, max: 200000 },
    { description: 'Private Equity Returns', min: 100000, max: 500000 },
    { description: 'Hedge Fund Distribution', min: 150000, max: 600000 },
    { description: 'Business Consulting Fee', min: 50000, max: 200000 },
    { description: 'Investment Advisory Fee', min: 30000, max: 120000 },
    { description: 'Stock Options Exercise Profit', min: 200000, max: 800000 },
    { description: 'Venture Capital Exit - Startup', min: 500000, max: 2000000 },
    { description: 'Angel Investment Return', min: 100000, max: 500000 },
    { description: 'Commercial Property Sale', min: 300000, max: 1500000 },
    { description: 'Art Collection Sale - Sotheby\'s', min: 150000, max: 600000 },
  ],
  expenses: [
    { description: 'Emirates First Class - Dubai to NYC', min: 25000, max: 45000 },
    { description: 'Singapore Airlines Suites - Singapore', min: 18000, max: 35000 },
    { description: 'Private Jet Charter - NetJets', min: 45000, max: 120000 },
    { description: 'Four Seasons Resort - Maldives', min: 35000, max: 75000 },
    { description: 'Aman Resort Tokyo', min: 28000, max: 55000 },
    { description: 'Burj Al Arab - Dubai Presidential Suite', min: 40000, max: 80000 },
    { description: 'Yacht Charter - Mediterranean', min: 150000, max: 350000 },
    { description: 'Yacht Maintenance - Annual', min: 50000, max: 150000 },
    { description: 'Marina Berth Fee - Monaco', min: 25000, max: 60000 },
    { description: 'Yacht Fuel & Supplies', min: 15000, max: 40000 },
    { description: 'Yacht Crew Salaries', min: 30000, max: 80000 },
    { description: 'Casino Royale - Monte Carlo', min: 50000, max: 250000 },
    { description: 'Bellagio Casino - Las Vegas', min: 30000, max: 150000 },
    { description: 'Marina Bay Sands Casino - Singapore', min: 40000, max: 200000 },
    { description: 'Wynn Casino - Macau', min: 60000, max: 300000 },
    { description: 'Cryptocurrency Purchase - Bitcoin', min: 100000, max: 500000 },
    { description: 'Stock Purchase - Tech Portfolio', min: 150000, max: 600000 },
    { description: 'NFT Purchase - Bored Ape', min: 200000, max: 400000 },
    { description: 'Hermès - Limited Edition Bags', min: 50000, max: 150000 },
    { description: 'Rolex Daytona - Limited Edition', min: 80000, max: 250000 },
    { description: 'Patek Philippe - Grand Complication', min: 200000, max: 500000 },
    { description: 'Louis Vuitton - Seasonal Collection', min: 30000, max: 80000 },
    { description: 'Bugatti Service & Maintenance', min: 25000, max: 60000 },
    { description: 'Ferrari Purchase - F8 Tributo', min: 280000, max: 350000 },
    { description: 'Lamborghini Aventador - Custom', min: 450000, max: 550000 },
    { description: 'McLaren 720S - Performance Pack', min: 300000, max: 380000 },
    { description: '1 OAK Nightclub - New York VIP', min: 15000, max: 40000 },
    { description: 'LIV Nightclub Miami - Table Service', min: 20000, max: 50000 },
    { description: 'Omnia Las Vegas - VIP Bottle Service', min: 18000, max: 45000 },
    { description: 'Hakkasan Las Vegas - VIP Experience', min: 22000, max: 55000 },
    { description: 'White Dubai - VIP Cabana', min: 25000, max: 60000 },
    { description: 'Eleven Madison Park - Private Dining', min: 8000, max: 20000 },
    { description: 'Noma Copenhagen - Chef\'s Table', min: 12000, max: 25000 },
    { description: 'Masa NYC - Omakase Experience', min: 15000, max: 30000 },
    { description: 'Sublimotion Ibiza - Exclusive Dinner', min: 20000, max: 40000 },
    { description: 'Manhattan Penthouse - Mortgage', min: 150000, max: 300000 },
    { description: 'Miami Beach Villa - Property Tax', min: 80000, max: 150000 },
    { description: 'Aspen Chalet - HOA Fees', min: 25000, max: 60000 },
    { description: 'Contemporary Art Purchase - Christie\'s', min: 200000, max: 800000 },
    { description: 'Rare Watch Collection - Phillips Auction', min: 150000, max: 500000 },
    { description: 'Vintage Wine - Romanée-Conti', min: 50000, max: 150000 },
    { description: 'Private Wealth Management Fee', min: 25000, max: 80000 },
    { description: 'Legal Retainer - Top Law Firm', min: 40000, max: 120000 },
    { description: 'Tax Advisory Services', min: 30000, max: 90000 },
    { description: 'Tom Ford Custom Suits', min: 25000, max: 60000 },
    { description: 'Brioni Bespoke Collection', min: 30000, max: 70000 },
  ]
}

function getRandomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateTransactionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `TXN${timestamp}${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { customerNumber, targetBalance = 500000, startDate, endDate } = body

    if (!customerNumber) {
      return NextResponse.json(
        { error: "Customer number is required" },
        { status: 400 }
      )
    }

    if (!targetBalance || targetBalance < 50000) {
      return NextResponse.json(
        { error: "Target balance must be at least $50,000" },
        { status: 400 }
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      )
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { customerNumber },
      include: { accounts: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    if (customer.accounts.length === 0) {
      return NextResponse.json(
        { error: "Customer has no accounts" },
        { status: 400 }
      )
    }

    const account = customer.accounts[0]

    // Generate transactions
    const transactionStartDate = new Date(startDate)
    const transactionEndDate = new Date(endDate)
    let transactions: any[] = []
    
    // Start with 10% of target balance to avoid negative (no transaction, just starting point)
    const initialBalance = Math.round(targetBalance * 0.1)
    let runningBalance = initialBalance
    
    let currentDate = new Date(transactionStartDate)
    const monthsTotal = Math.ceil((transactionEndDate.getTime() - transactionStartDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    const balanceGrowthPerMonth = (targetBalance - runningBalance) / monthsTotal
    
    while (currentDate < transactionEndDate) {
      const monthTransactions = []
      
      // Calculate target for this month
      const monthTarget = runningBalance + balanceGrowthPerMonth
      
      // Calculate the end of current month OR the transaction end date, whichever is earlier
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const monthEndDate = endOfMonth < transactionEndDate ? endOfMonth : transactionEndDate
      
      // Income transactions (3-6 per month) - more balanced
      const incomeCount = Math.floor(Math.random() * 4) + 3
      let monthIncome = 0
      
      for (let i = 0; i < incomeCount; i++) {
        const incomeType = luxuryTransactions.income[Math.floor(Math.random() * luxuryTransactions.income.length)]
        const amount = getRandomAmount(incomeType.min, incomeType.max)
        const date = getRandomDate(currentDate, monthEndDate)
        
        monthIncome += amount
        const balanceBefore = runningBalance
        runningBalance += amount
        
        monthTransactions.push({
          transactionId: generateTransactionId(),
          accountId: account.id,
          type: 'CREDIT',
          amount: new Decimal(amount),
          description: incomeType.description,
          status: 'COMPLETED',
          transactionDate: date,
          balanceBefore: new Decimal(balanceBefore),
          balanceAfter: new Decimal(runningBalance)
        })
      }
      
      // Expense transactions (6-10 per month) - reduced to balance better
      const expenseCount = Math.floor(Math.random() * 5) + 6
      let monthExpenses = 0
      
      for (let i = 0; i < expenseCount; i++) {
        const expenseType = luxuryTransactions.expenses[Math.floor(Math.random() * luxuryTransactions.expenses.length)]
        // Reduce expense amounts to keep balance positive
        const maxExpense = Math.min(
          expenseType.max,
          (runningBalance + monthIncome - monthExpenses) * 0.3 // Don't spend more than 30% of available
        )
        const amount = getRandomAmount(expenseType.min, Math.max(expenseType.min, maxExpense))
        const date = getRandomDate(currentDate, monthEndDate)
        
        monthExpenses += amount
        const balanceBefore = runningBalance
        runningBalance -= amount
        
        // Don't let balance go too negative (allow max 20% negative of target)
        if (runningBalance < -(targetBalance * 0.2)) {
          runningBalance += amount // Revert this transaction
          continue // Skip this expense
        }
        
        monthTransactions.push({
          transactionId: generateTransactionId(),
          accountId: account.id,
          type: 'DEBIT',
          amount: new Decimal(amount),
          description: expenseType.description,
          status: 'COMPLETED',
          transactionDate: date,
          balanceBefore: new Decimal(balanceBefore),
          balanceAfter: new Decimal(runningBalance)
        })
      }
      
      // Month processing complete
      
      transactions.push(...monthTransactions)
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Sort by transactionDate
    transactions.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime())

    // Add adjustment if needed
    const balanceAdjustment = targetBalance - runningBalance
    if (Math.abs(balanceAdjustment) > 10000) {
      // Use midpoint of date range for adjustment
      const midpointTime = (transactionStartDate.getTime() + transactionEndDate.getTime()) / 2
      const adjustmentDate = new Date(midpointTime)
      const balanceBefore = runningBalance
      const balanceAfter = balanceAdjustment > 0 ? runningBalance + Math.abs(balanceAdjustment) : runningBalance - Math.abs(balanceAdjustment)
      
      transactions.push({
        transactionId: generateTransactionId(),
        accountId: account.id,
        type: balanceAdjustment > 0 ? 'CREDIT' : 'DEBIT',
        amount: new Decimal(Math.abs(balanceAdjustment)),
        description: balanceAdjustment > 0 
          ? 'Venture Capital Exit - Tech Startup IPO'
          : 'Real Estate Investment - Portfolio Acquisition',
        status: 'COMPLETED',
        transactionDate: adjustmentDate,
        balanceBefore: new Decimal(balanceBefore),
        balanceAfter: new Decimal(balanceAfter)
      })
    }

    // Sort again and recalculate balances
    transactions.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime())
    
    let balance = 0
    transactions = transactions.map(txn => {
      const balanceBefore = balance
      // Amount is already signed (positive for CREDIT, negative for DEBIT)
      balance += parseFloat(txn.amount.toString())
      return {
        ...txn,
        balanceBefore: new Decimal(balanceBefore),
        balanceAfter: new Decimal(balance)
      }
    })

    // Delete existing transactions
    await prisma.transaction.deleteMany({
      where: { accountId: account.id }
    })

    // Insert new transactions in batches
    const batchSize = 100
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      await prisma.transaction.createMany({
        data: batch
      })
    }

    // Update account balance
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: new Decimal(targetBalance) }
    })

    // Calculate totals
    const totalCredits = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    const totalDebits = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount.toString())), 0)

    return NextResponse.json({
      message: "Luxury transaction history generated successfully",
      transactionCount: transactions.length,
      totalCredits: Math.round(totalCredits),
      totalDebits: Math.round(totalDebits),
      finalBalance: targetBalance
    })

  } catch (error: any) {
    // Safe error logging
    if (error && typeof error === 'object') {
      console.error("Error generating luxury transactions:", {
        message: error.message,
        code: error.code,
        name: error.name
      })
    } else {
      console.error("Error generating luxury transactions:", String(error))
    }
    
    return NextResponse.json(
      { error: error?.message || "Failed to generate transactions" },
      { status: 500 }
    )
  }
}
