import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const accountNumber = '71345818'
  
  console.log(`\n🔧 Fixing negative DEBIT amounts and deleting transaction #3...\n`)

  // Find account
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
      }
    }
  })
  
  if (!account) {
    console.log('❌ Account not found')
    return
  }
  
  console.log(`✅ Account: ${account.accountNumber}`)
  console.log(`   Customer: ${account.customer.firstName} ${account.customer.lastName}\n`)

  // Get transaction #3 (index 2, since 0-indexed)
  const transactionToDelete = account.transactions[2]
  
  if (transactionToDelete) {
    console.log(`🗑️  Deleting transaction #3:`)
    console.log(`   Description: ${transactionToDelete.description}`)
    console.log(`   Amount: $${transactionToDelete.amount}`)
    console.log(`   Type: ${transactionToDelete.type}`)
    console.log(`   ID: ${transactionToDelete.id}\n`)
    
    await prisma.transaction.delete({
      where: { id: transactionToDelete.id }
    })
    
    console.log(`   ✅ Transaction deleted!\n`)
  }

  // Fix all negative DEBIT amounts
  console.log(`🔧 Fixing negative DEBIT amounts...\n`)
  
  const negativeDebits = await prisma.transaction.findMany({
    where: {
      accountId: account.id,
      type: 'DEBIT',
      amount: {
        lt: 0
      }
    }
  })
  
  console.log(`   Found ${negativeDebits.length} negative DEBIT transactions\n`)
  
  for (const txn of negativeDebits) {
    const positiveAmount = Math.abs(Number(txn.amount))
    console.log(`   Fixing: ${txn.description} - $${txn.amount} → $${positiveAmount}`)
    
    await prisma.transaction.update({
      where: { id: txn.id },
      data: { amount: positiveAmount }
    })
  }
  
  console.log(`\n✅ All negative amounts fixed!\n`)
  console.log(`✨ Done! Please restart your dev server for frontend changes to take effect.\n`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
