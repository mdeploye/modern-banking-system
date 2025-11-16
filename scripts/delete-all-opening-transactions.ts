import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`\n🗑️  Deleting ALL account opening transactions...\n`)

  // Find all transactions with opening-related descriptions
  const openingTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { description: { contains: 'Initial Account Funding', mode: 'insensitive' } },
        { description: { contains: 'Account Opening', mode: 'insensitive' } },
        { description: { contains: 'Opening Account', mode: 'insensitive' } },
        { type: 'OPENING' },
      ]
    },
    include: {
      account: {
        select: {
          accountNumber: true,
          accountType: true
        }
      }
    }
  })

  console.log(`Found ${openingTransactions.length} account opening transactions\n`)

  if (openingTransactions.length === 0) {
    console.log('✅ No opening transactions to delete\n')
    return
  }

  for (const txn of openingTransactions) {
    console.log(`  Deleting: ${txn.description} - ${txn.account.accountNumber} (${txn.account.accountType})`)
  }

  // Delete all found transactions
  const result = await prisma.transaction.deleteMany({
    where: {
      OR: [
        { description: { contains: 'Initial Account Funding', mode: 'insensitive' } },
        { description: { contains: 'Account Opening', mode: 'insensitive' } },
        { description: { contains: 'Opening Account', mode: 'insensitive' } },
        { type: 'OPENING' },
      ]
    }
  })

  console.log(`\n✅ Deleted ${result.count} account opening transactions\n`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
