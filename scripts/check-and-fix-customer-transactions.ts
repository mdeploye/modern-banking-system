import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const accountNumber = '71345818'
  
  console.log(`\n🔍 Checking transactions for account ${accountNumber}...\n`)

  // Find account and customer
  const account = await prisma.account.findUnique({
    where: { accountNumber },
    include: {
      customer: {
        include: {
          user: true
        }
      },
      transactions: {
        orderBy: { transactionDate: 'desc' },
        take: 20
      }
    }
  })
  
  if (!account) {
    console.log('❌ Account not found')
    return
  }
  
  const customer = account.customer

  console.log(`✅ Customer: ${customer.firstName} ${customer.lastName}`)
  console.log(`📧 Email: ${customer.user.email}`)
  console.log(`💳 Account: ${account.accountNumber} (${account.accountType})`)
  console.log(`   Balance: $${account.balance}\n`)

  if (account.transactions.length === 0) {
    console.log('   No transactions')
    return
  }

  console.log('   Transactions:')
  account.transactions.forEach((txn, index) => {
    const sign = txn.type === 'CREDIT' ? '+' : '-'
    const color = txn.type === 'CREDIT' ? '🟢' : '🔴'
    console.log(`   ${index + 1}. ${color} [${txn.type}] ${sign}$${txn.amount} - ${txn.description}`)
    console.log(`      ID: ${txn.id}`)
    console.log(`      Transaction ID: ${txn.transactionId}`)
    console.log(`      Date: ${txn.transactionDate}`)
    console.log(`      Balance: $${txn.balanceBefore} → $${txn.balanceAfter}`)
    console.log('')
  })

  // Find "Initial Account Funding" or "Opening Account" transaction
  const openingTransaction = account.transactions.find(txn => 
    txn.description.toLowerCase().includes('initial account funding') ||
    txn.description.toLowerCase().includes('opening account') ||
    txn.description.toLowerCase().includes('account opening')
  )

  if (openingTransaction) {
    console.log(`\n   ⚠️  Found opening transaction to delete:`)
    console.log(`   Description: ${openingTransaction.description}`)
    console.log(`   Amount: $${openingTransaction.amount}`)
    console.log(`   ID: ${openingTransaction.id}`)
    
    // Ask for confirmation
    console.log(`\n   🗑️  Deleting transaction...`)
    
    await prisma.transaction.delete({
      where: { id: openingTransaction.id }
    })
    
    console.log(`   ✅ Transaction deleted!\n`)
  } else {
    console.log(`\n   ℹ️  No opening account transaction found to delete.\n`)
  }

  console.log('\n✨ Done!\n')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
