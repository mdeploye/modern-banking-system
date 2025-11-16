import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const accountNumber = '71345818'
  
  console.log(`\n🗑️  Deleting transaction #3 for account ${accountNumber}...\n`)

  const account = await prisma.account.findUnique({
    where: { accountNumber },
    include: {
      transactions: {
        orderBy: { transactionDate: 'desc' },
        take: 5
      }
    }
  })
  
  if (!account) {
    console.log('❌ Account not found')
    return
  }

  const txn3 = account.transactions[2] // Index 2 = transaction #3
  
  if (txn3) {
    console.log(`Transaction #3 to delete:`)
    console.log(`  Description: ${txn3.description}`)
    console.log(`  Amount: $${txn3.amount}`)
    console.log(`  Type: ${txn3.type}`)
    console.log(`  Date: ${txn3.transactionDate}\n`)
    
    await prisma.transaction.delete({
      where: { id: txn3.id }
    })
    
    console.log(`✅ Transaction #3 deleted!\n`)
  } else {
    console.log('❌ Transaction #3 not found')
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
