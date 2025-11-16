import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const accountNumber = '71345818'
  
  console.log(`\n🔍 Checking transaction #2 details...\n`)

  const account = await prisma.account.findUnique({
    where: { accountNumber },
    include: {
      transactions: {
        orderBy: { transactionDate: 'desc' },
        take: 3
      }
    }
  })
  
  if (!account) {
    console.log('❌ Account not found')
    return
  }

  const txn2 = account.transactions[1] // Index 1 = transaction #2
  
  if (txn2) {
    console.log('Transaction #2 Details:')
    console.log(`  Type: ${txn2.type}`)
    console.log(`  Amount: $${txn2.amount}`)
    console.log(`  Balance Before: $${txn2.balanceBefore}`)
    console.log(`  Balance After: $${txn2.balanceAfter}`)
    console.log(`  Description: ${txn2.description}`)
    
    const balanceIncrease = Number(txn2.balanceAfter) > Number(txn2.balanceBefore)
    console.log(`\n  Balance ${balanceIncrease ? 'INCREASED' : 'DECREASED'} - Should display as ${balanceIncrease ? 'CREDIT (green +)' : 'DEBIT (red -)'}`)
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
