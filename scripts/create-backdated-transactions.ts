import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Realistic transaction types and amounts
const transactionTemplates = [
  // Rent/Mortgage (monthly)
  { description: 'Mortgage Payment - Wells Fargo', amount: 3500, frequency: 'monthly' },
  { description: 'HOA Fees', amount: 450, frequency: 'monthly' },
  
  // Utilities (monthly)
  { description: 'Electric Bill - PG&E', amount: 280, frequency: 'monthly' },
  { description: 'Water & Sewer - City Utilities', amount: 120, frequency: 'monthly' },
  { description: 'Internet - Comcast', amount: 89.99, frequency: 'monthly' },
  { description: 'Mobile Phone - Verizon', amount: 145, frequency: 'monthly' },
  { description: 'Gas Bill - SoCalGas', amount: 95, frequency: 'monthly' },
  
  // Insurance (monthly)
  { description: 'Car Insurance - Geico', amount: 285, frequency: 'monthly' },
  { description: 'Health Insurance Premium', amount: 650, frequency: 'monthly' },
  { description: 'Home Insurance', amount: 195, frequency: 'monthly' },
  
  // Subscriptions (monthly)
  { description: 'Netflix Subscription', amount: 15.99, frequency: 'monthly' },
  { description: 'Amazon Prime', amount: 14.99, frequency: 'monthly' },
  { description: 'Spotify Premium', amount: 10.99, frequency: 'monthly' },
  { description: 'Disney+ Subscription', amount: 7.99, frequency: 'monthly' },
  { description: 'Gym Membership - LA Fitness', amount: 45, frequency: 'monthly' },
  
  // Groceries (weekly)
  { description: 'Whole Foods Market', amount: 185, frequency: 'weekly' },
  { description: 'Trader Joes', amount: 125, frequency: 'weekly' },
  { description: 'Costco', amount: 320, frequency: 'biweekly' },
  { description: 'Target', amount: 95, frequency: 'weekly' },
  
  // Dining (frequent)
  { description: 'Starbucks', amount: 6.50, frequency: 'daily' },
  { description: 'Chipotle', amount: 12.75, frequency: 'weekly' },
  { description: 'Olive Garden', amount: 65, frequency: 'biweekly' },
  { description: 'Panera Bread', amount: 18, frequency: 'weekly' },
  { description: 'McDonalds', amount: 8.50, frequency: 'weekly' },
  { description: 'Dominos Pizza', amount: 28, frequency: 'weekly' },
  { description: 'The Cheesecake Factory', amount: 95, frequency: 'monthly' },
  
  // Gas/Transportation
  { description: 'Shell Gas Station', amount: 65, frequency: 'weekly' },
  { description: 'Chevron', amount: 70, frequency: 'weekly' },
  { description: 'Uber', amount: 25, frequency: 'weekly' },
  { description: 'Lyft', amount: 18, frequency: 'biweekly' },
  
  // Shopping
  { description: 'Amazon.com', amount: 145, frequency: 'biweekly' },
  { description: 'Walmart', amount: 85, frequency: 'weekly' },
  { description: 'Best Buy', amount: 250, frequency: 'monthly' },
  { description: 'Home Depot', amount: 175, frequency: 'monthly' },
  { description: 'Kohls', amount: 120, frequency: 'monthly' },
  { description: 'Macys', amount: 95, frequency: 'monthly' },
  
  // Healthcare
  { description: 'CVS Pharmacy', amount: 45, frequency: 'monthly' },
  { description: 'Walgreens', amount: 35, frequency: 'monthly' },
  { description: 'Dr. Smith - Medical', amount: 150, frequency: 'quarterly' },
  { description: 'Dental Care - Dr. Johnson', amount: 125, frequency: 'quarterly' },
  
  // Entertainment
  { description: 'AMC Theatres', amount: 35, frequency: 'biweekly' },
  { description: 'Barnes & Noble', amount: 45, frequency: 'monthly' },
  { description: 'iTunes/App Store', amount: 25, frequency: 'biweekly' },
  
  // Miscellaneous
  { description: 'Pet Supplies - PetSmart', amount: 85, frequency: 'monthly' },
  { description: 'Dry Cleaning', amount: 35, frequency: 'biweekly' },
  { description: 'Car Wash', amount: 15, frequency: 'weekly' },
  { description: 'Parking Fee', amount: 12, frequency: 'weekly' },
]

// Large occasional expenses
const largeExpenses = [
  { description: 'Car Repair - Auto Service Center', amount: 2850 },
  { description: 'Appliance Repair - Home Services', amount: 450 },
  { description: 'Dental Work - Advanced Dentistry', amount: 1800 },
  { description: 'Annual Property Tax', amount: 4500 },
  { description: 'Home Renovation - Contractors Inc', amount: 8500 },
  { description: 'Laptop Purchase - Apple Store', amount: 2499 },
  { description: 'Furniture - Restoration Hardware', amount: 3200 },
  { description: 'Wedding Gift', amount: 500 },
  { description: 'Vacation - Expedia Hotels', amount: 2800 },
  { description: 'Flight Tickets - United Airlines', amount: 1850 },
  { description: 'Car Detailing & Service', amount: 650 },
  { description: 'Legal Fees - Attorney', amount: 1500 },
  { description: 'Tax Preparation Services', amount: 850 },
]

function getRandomDate(daysAgo: number): Date {
  const now = new Date()
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() - daysAgo)
  
  // Add random hours/minutes for realism
  targetDate.setHours(Math.floor(Math.random() * 24))
  targetDate.setMinutes(Math.floor(Math.random() * 60))
  
  return targetDate
}

async function main() {
  const accountNumber = '71345808'
  const targetDebit = 567356.00
  
  console.log(`🔍 Finding account ${accountNumber}...`)
  
  const account = await prisma.account.findUnique({
    where: { accountNumber },
    include: { customer: true }
  })
  
  if (!account) {
    console.error(`❌ Account ${accountNumber} not found!`)
    return
  }
  
  console.log(`✅ Found account: ${accountNumber}`)
  console.log(`   Current Balance: $${account.balance}`)
  console.log(`   Target Debit: $${targetDebit}`)
  
  let totalDebited = 0
  const transactions = []
  const fourMonthsAgo = 120 // days
  
  // Generate transactions for the past 4 months
  console.log('\n📝 Generating transactions...')
  
  // Add regular monthly bills (4 months)
  for (let month = 0; month < 4; month++) {
    const monthOffset = month * 30
    
    transactionTemplates.forEach(template => {
      if (template.frequency === 'monthly') {
        const date = getRandomDate(monthOffset + Math.floor(Math.random() * 10))
        const amount = template.amount + (Math.random() * 20 - 10) // Add some variance
        
        if (totalDebited + amount <= targetDebit) {
          transactions.push({
            date,
            description: template.description,
            amount: Math.round(amount * 100) / 100
          })
          totalDebited += amount
        }
      }
    })
  }
  
  // Add weekly transactions
  for (let week = 0; week < 16; week++) {
    const weekOffset = week * 7
    
    transactionTemplates.forEach(template => {
      if (template.frequency === 'weekly') {
        const date = getRandomDate(weekOffset + Math.floor(Math.random() * 3))
        const amount = template.amount + (Math.random() * 10 - 5)
        
        if (totalDebited + amount <= targetDebit) {
          transactions.push({
            date,
            description: template.description,
            amount: Math.round(amount * 100) / 100
          })
          totalDebited += amount
        }
      }
    })
  }
  
  // Add biweekly transactions
  for (let period = 0; period < 8; period++) {
    const periodOffset = period * 14
    
    transactionTemplates.forEach(template => {
      if (template.frequency === 'biweekly') {
        const date = getRandomDate(periodOffset + Math.floor(Math.random() * 5))
        const amount = template.amount + (Math.random() * 15 - 7)
        
        if (totalDebited + amount <= targetDebit) {
          transactions.push({
            date,
            description: template.description,
            amount: Math.round(amount * 100) / 100
          })
          totalDebited += amount
        }
      }
    })
  }
  
  // Add daily transactions (like coffee)
  for (let day = 0; day < 90; day++) {
    transactionTemplates.forEach(template => {
      if (template.frequency === 'daily' && Math.random() > 0.3) { // 70% chance
        const date = getRandomDate(day)
        const amount = template.amount + (Math.random() * 2 - 1)
        
        if (totalDebited + amount <= targetDebit) {
          transactions.push({
            date,
            description: template.description,
            amount: Math.round(amount * 100) / 100
          })
          totalDebited += amount
        }
      }
    })
  }
  
  // Fill remaining amount with large expenses
  largeExpenses.forEach(expense => {
    if (totalDebited < targetDebit) {
      const remaining = targetDebit - totalDebited
      if (expense.amount <= remaining) {
        const date = getRandomDate(Math.floor(Math.random() * fourMonthsAgo))
        transactions.push({
          date,
          description: expense.description,
          amount: expense.amount
        })
        totalDebited += expense.amount
      }
    }
  })
  
  // If still not enough, add random large transactions to make up the difference
  while (totalDebited < targetDebit - 100) {
    const remaining = targetDebit - totalDebited
    const amount = Math.min(remaining, Math.random() * 5000 + 1000)
    const date = getRandomDate(Math.floor(Math.random() * fourMonthsAgo))
    
    transactions.push({
      date,
      description: 'Miscellaneous Expense',
      amount: Math.round(amount * 100) / 100
    })
    totalDebited += amount
  }
  
  // Sort by date (oldest first)
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
  
  console.log(`\n💰 Total to debit: $${totalDebited.toFixed(2)}`)
  console.log(`📊 Number of transactions: ${transactions.length}`)
  console.log(`\n🔄 Creating transactions in database...`)
  
  // Insert transactions using raw SQL to set custom createdAt
  let currentBalance = Number(account.balance)
  let count = 0
  
  for (const txn of transactions) {
    const balanceBefore = currentBalance
    currentBalance -= txn.amount
    const balanceAfter = currentBalance
    
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO transactions (
        id, "accountId", "transactionId", type, amount, 
        "balanceBefore", "balanceAfter", description, status, 
        "transactionDate"
      ) VALUES (
        gen_random_uuid(), 
        ${account.id}::text,
        ${transactionId},
        'DEBIT',
        ${txn.amount},
        ${balanceBefore},
        ${balanceAfter},
        ${txn.description},
        'COMPLETED',
        ${txn.date}::timestamp
      )
    `
    
    count++
    if (count % 50 === 0) {
      console.log(`   Created ${count}/${transactions.length} transactions...`)
    }
  }
  
  // Update account balance
  await prisma.account.update({
    where: { id: account.id },
    data: { balance: currentBalance }
  })
  
  console.log(`\n✅ Successfully created ${transactions.length} transactions!`)
  console.log(`\n📊 Account Summary:`)
  console.log(`   Previous Balance: $${Number(account.balance).toFixed(2)}`)
  console.log(`   Total Debited: $${totalDebited.toFixed(2)}`)
  console.log(`   New Balance: $${currentBalance.toFixed(2)}`)
  console.log(`\n🗓️  Transaction Date Range:`)
  console.log(`   Oldest: ${transactions[0].date.toLocaleDateString()}`)
  console.log(`   Newest: ${transactions[transactions.length - 1].date.toLocaleDateString()}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
