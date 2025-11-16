import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// High-class lifestyle transactions
const luxuryTransactions = {
  income: [
    // Investment Income
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
    { description: 'Rare Wine Auction Proceeds', min: 50000, max: 200000 },
    { description: 'Luxury Car Collection Sale', min: 200000, max: 800000 },
  ],
  expenses: [
    // Travel & Leisure
    { description: 'Emirates First Class - Dubai to NYC', min: 25000, max: 45000, category: 'TRAVEL' },
    { description: 'Singapore Airlines Suites - Singapore', min: 18000, max: 35000, category: 'TRAVEL' },
    { description: 'Private Jet Charter - NetJets', min: 45000, max: 120000, category: 'TRAVEL' },
    { description: 'Four Seasons Resort - Maldives', min: 35000, max: 75000, category: 'TRAVEL' },
    { description: 'Aman Resort Tokyo', min: 28000, max: 55000, category: 'TRAVEL' },
    { description: 'Burj Al Arab - Dubai Presidential Suite', min: 40000, max: 80000, category: 'TRAVEL' },
    
    // Yacht & Marine
    { description: 'Yacht Charter - Mediterranean', min: 150000, max: 350000, category: 'LUXURY' },
    { description: 'Yacht Maintenance - Annual', min: 50000, max: 150000, category: 'LUXURY' },
    { description: 'Marina Berth Fee - Monaco', min: 25000, max: 60000, category: 'LUXURY' },
    { description: 'Yacht Fuel & Supplies', min: 15000, max: 40000, category: 'LUXURY' },
    { description: 'Yacht Crew Salaries', min: 30000, max: 80000, category: 'LUXURY' },
    
    // Gambling & Entertainment
    { description: 'Casino Royale - Monte Carlo', min: 50000, max: 250000, category: 'ENTERTAINMENT' },
    { description: 'Bellagio Casino - Las Vegas', min: 30000, max: 150000, category: 'ENTERTAINMENT' },
    { description: 'Marina Bay Sands Casino - Singapore', min: 40000, max: 200000, category: 'ENTERTAINMENT' },
    { description: 'Wynn Casino - Macau', min: 60000, max: 300000, category: 'ENTERTAINMENT' },
    
    // Crypto & Trading
    { description: 'Cryptocurrency Purchase - Bitcoin', min: 100000, max: 500000, category: 'INVESTMENT' },
    { description: 'Stock Purchase - Tech Portfolio', min: 150000, max: 600000, category: 'INVESTMENT' },
    { description: 'NFT Purchase - Bored Ape', min: 200000, max: 400000, category: 'INVESTMENT' },
    { description: 'Trading Platform Fee - Interactive Brokers', min: 5000, max: 15000, category: 'INVESTMENT' },
    { description: 'Cryptocurrency Trading Fee - Coinbase', min: 3000, max: 10000, category: 'INVESTMENT' },
    
    // Luxury Shopping
    { description: 'Hermès - Limited Edition Bags', min: 50000, max: 150000, category: 'SHOPPING' },
    { description: 'Rolex Daytona - Limited Edition', min: 80000, max: 250000, category: 'SHOPPING' },
    { description: 'Patek Philippe - Grand Complication', min: 200000, max: 500000, category: 'SHOPPING' },
    { description: 'Louis Vuitton - Seasonal Collection', min: 30000, max: 80000, category: 'SHOPPING' },
    { description: 'Bugatti Service & Maintenance', min: 25000, max: 60000, category: 'AUTOMOTIVE' },
    { description: 'Ferrari Purchase - F8 Tributo', min: 280000, max: 350000, category: 'AUTOMOTIVE' },
    { description: 'Lamborghini Aventador - Custom', min: 450000, max: 550000, category: 'AUTOMOTIVE' },
    { description: 'McLaren 720S - Performance Pack', min: 300000, max: 380000, category: 'AUTOMOTIVE' },
    
    // Clubs & Nightlife
    { description: '1 OAK Nightclub - New York VIP', min: 15000, max: 40000, category: 'ENTERTAINMENT' },
    { description: 'LIV Nightclub Miami - Table Service', min: 20000, max: 50000, category: 'ENTERTAINMENT' },
    { description: 'Omnia Las Vegas - VIP Bottle Service', min: 18000, max: 45000, category: 'ENTERTAINMENT' },
    { description: 'Hakkasan Las Vegas - VIP Experience', min: 22000, max: 55000, category: 'ENTERTAINMENT' },
    { description: 'White Dubai - VIP Cabana', min: 25000, max: 60000, category: 'ENTERTAINMENT' },
    
    // Fine Dining & Bars
    { description: 'Eleven Madison Park - Private Dining', min: 8000, max: 20000, category: 'DINING' },
    { description: 'Noma Copenhagen - Chef\'s Table', min: 12000, max: 25000, category: 'DINING' },
    { description: 'Masa NYC - Omakase Experience', min: 15000, max: 30000, category: 'DINING' },
    { description: 'Sublimotion Ibiza - Exclusive Dinner', min: 20000, max: 40000, category: 'DINING' },
    { description: 'The Connaught Bar - Rare Spirits', min: 5000, max: 15000, category: 'DINING' },
    { description: 'American Bar London - Vintage Collection', min: 8000, max: 18000, category: 'DINING' },
    
    // Real Estate & Property
    { description: 'Manhattan Penthouse - Mortgage', min: 150000, max: 300000, category: 'REAL_ESTATE' },
    { description: 'Miami Beach Villa - Property Tax', min: 80000, max: 150000, category: 'REAL_ESTATE' },
    { description: 'Aspen Chalet - HOA Fees', min: 25000, max: 60000, category: 'REAL_ESTATE' },
    { description: 'Property Management Services', min: 15000, max: 40000, category: 'REAL_ESTATE' },
    
    // Art & Collectibles
    { description: 'Contemporary Art Purchase - Christie\'s', min: 200000, max: 800000, category: 'ART' },
    { description: 'Rare Watch Collection - Phillips Auction', min: 150000, max: 500000, category: 'COLLECTIBLES' },
    { description: 'Vintage Wine - Romanée-Conti', min: 50000, max: 150000, category: 'COLLECTIBLES' },
    { description: 'Classic Car Restoration', min: 100000, max: 300000, category: 'COLLECTIBLES' },
    
    // Professional Services
    { description: 'Private Wealth Management Fee', min: 25000, max: 80000, category: 'SERVICES' },
    { description: 'Legal Retainer - Top Law Firm', min: 40000, max: 120000, category: 'SERVICES' },
    { description: 'Tax Advisory Services', min: 30000, max: 90000, category: 'SERVICES' },
    { description: 'Personal Security Services', min: 20000, max: 60000, category: 'SERVICES' },
    { description: 'Private Medical Concierge', min: 15000, max: 45000, category: 'SERVICES' },
    
    // Fashion & Personal Care
    { description: 'Tom Ford Custom Suits', min: 25000, max: 60000, category: 'FASHION' },
    { description: 'Brioni Bespoke Collection', min: 30000, max: 70000, category: 'FASHION' },
    { description: 'Private Spa & Wellness Retreat', min: 20000, max: 50000, category: 'WELLNESS' },
    { description: 'Personal Trainer & Nutritionist', min: 10000, max: 30000, category: 'WELLNESS' },
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

async function generateLuxuryTransactionHistory(
  customerNumber: string,
  targetBalance: number = 8600000 // 8.6 million
) {
  console.log(`🎰 Generating luxury transaction history for customer: ${customerNumber}`)
  console.log(`🎯 Target final balance: $${targetBalance.toLocaleString()}`)

  // Find customer
  const customer = await prisma.customer.findUnique({
    where: { customerNumber },
    include: { accounts: true }
  })

  if (!customer) {
    throw new Error(`Customer ${customerNumber} not found`)
  }

  if (customer.accounts.length === 0) {
    throw new Error(`Customer ${customerNumber} has no accounts`)
  }

  const account = customer.accounts[0] // Use first account (checking)
  console.log(`💳 Using account: ${account.accountNumber}`)

  // Date range: Jan 1, 2023 to Now
  const startDate = new Date('2023-01-01')
  const endDate = new Date()

  // Calculate how much we need in total transactions
  const currentBalance = parseFloat(account.balance.toString())
  console.log(`💰 Current balance: $${currentBalance.toLocaleString()}`)

  let transactions: any[] = []
  let runningBalance = currentBalance

  // Generate transactions for each month from 2023 to now
  let currentDate = new Date(startDate)
  
  while (currentDate < endDate) {
    const monthTransactions = []
    
    // Income transactions (2-5 per month)
    const incomeCount = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < incomeCount; i++) {
      const incomeType = luxuryTransactions.income[Math.floor(Math.random() * luxuryTransactions.income.length)]
      const amount = getRandomAmount(incomeType.min, incomeType.max)
      const date = getRandomDate(currentDate, new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))
      
      monthTransactions.push({
        transactionId: generateTransactionId(),
        accountId: account.id,
        type: 'CREDIT',
        amount: new Decimal(amount),
        balanceBefore: new Decimal(runningBalance),
        balanceAfter: new Decimal(runningBalance + amount),
        description: incomeType.description,
        status: 'COMPLETED',
        transactionDate: date
      })
      
      runningBalance += amount
    }
    
    // Expense transactions (8-15 per month for luxury lifestyle)
    const expenseCount = Math.floor(Math.random() * 8) + 8
    for (let i = 0; i < expenseCount; i++) {
      const expenseType = luxuryTransactions.expenses[Math.floor(Math.random() * luxuryTransactions.expenses.length)]
      const amount = getRandomAmount(expenseType.min, expenseType.max)
      const date = getRandomDate(currentDate, new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))
      
      monthTransactions.push({
        transactionId: generateTransactionId(),
        accountId: account.id,
        type: 'DEBIT',
        amount: new Decimal(-amount),
        balanceBefore: new Decimal(runningBalance),
        balanceAfter: new Decimal(runningBalance - amount),
        description: expenseType.description,
        status: 'COMPLETED',
        transactionDate: date
      })
      
      runningBalance -= amount
    }
    
    transactions.push(...monthTransactions)
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Sort transactions by date
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Recalculate balances in order and adjust to reach target
  const balanceAdjustment = targetBalance - runningBalance
  console.log(`⚖️  Balance adjustment needed: $${balanceAdjustment.toLocaleString()}`)

  // Add a large one-time income to reach target if needed
  if (Math.abs(balanceAdjustment) > 100000) {
    const adjustmentDate = new Date('2023-06-15')
    const adjustmentDescription = balanceAdjustment > 0 
      ? 'Venture Capital Exit - Tech Startup IPO'
      : 'Real Estate Investment - Portfolio Acquisition'
    
    transactions.push({
      transactionId: generateTransactionId(),
      accountId: account.id,
      type: balanceAdjustment > 0 ? 'CREDIT' : 'DEBIT',
      amount: new Decimal(balanceAdjustment),
      balanceBefore: new Decimal(0),
      balanceAfter: new Decimal(0),
      description: adjustmentDescription,
      status: 'COMPLETED',
      transactionDate: adjustmentDate
    })
  }

  // Sort again and recalculate balances
  transactions.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime())
  
  let balance = 0
  transactions = transactions.map(txn => {
    const txnAmount = parseFloat(txn.amount.toString())
    const balanceBefore = balance
    
    // Amount is already signed (positive for CREDIT, negative for DEBIT)
    balance += txnAmount
    
    return {
      ...txn,
      balanceBefore: new Decimal(balanceBefore),
      balanceAfter: new Decimal(balance)
    }
  })

  console.log(`📊 Generated ${transactions.length} transactions`)
  console.log(`💵 Final calculated balance: $${balance.toLocaleString()}`)

  // Delete existing transactions for this account
  console.log(`🗑️  Deleting existing transactions...`)
  await prisma.transaction.deleteMany({
    where: { accountId: account.id }
  })

  // Insert transactions in batches
  console.log(`💾 Inserting transactions...`)
  const batchSize = 100
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)
    await prisma.transaction.createMany({
      data: batch
    })
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transactions.length / batchSize)}`)
  }

  // Update account balance
  await prisma.account.update({
    where: { id: account.id },
    data: { balance: new Decimal(targetBalance) }
  })

  console.log(`✅ Transaction history generated successfully!`)
  console.log(`📈 Total Credits: $${transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toLocaleString()}`)
  console.log(`📉 Total Debits: $${transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toLocaleString()}`)
  console.log(`💰 Final Balance: $${targetBalance.toLocaleString()}`)

  return {
    transactionCount: transactions.length,
    finalBalance: targetBalance
  }
}

// CLI Usage
const customerNumber = process.argv[2]
const targetBalance = process.argv[3] ? parseFloat(process.argv[3]) : 8600000

if (!customerNumber) {
  console.error('❌ Usage: npx ts-node scripts/generate-luxury-transactions.ts <customerNumber> [targetBalance]')
  console.error('   Example: npx ts-node scripts/generate-luxury-transactions.ts CUS001 8600000')
  process.exit(1)
}

generateLuxuryTransactionHistory(customerNumber, targetBalance)
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
