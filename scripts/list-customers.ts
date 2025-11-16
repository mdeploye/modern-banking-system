import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listCustomers() {
  console.log('📋 Fetching all customers...\n')

  const customers = await prisma.customer.findMany({
    include: {
      user: {
        select: {
          email: true
        }
      },
      accounts: {
        select: {
          accountNumber: true,
          accountType: true,
          balance: true,
          status: true
        }
      }
    },
    orderBy: {
      customerNumber: 'asc'
    }
  })

  if (customers.length === 0) {
    console.log('❌ No customers found in database')
    return
  }

  console.log(`✅ Found ${customers.length} customers:\n`)
  console.log('━'.repeat(100))

  customers.forEach((customer, index) => {
    console.log(`\n${index + 1}. ${customer.firstName} ${customer.lastName}`)
    console.log(`   Customer Number: ${customer.customerNumber}`)
    console.log(`   Email: ${customer.user.email}`)
    console.log(`   Mobile: ${customer.mobile || 'N/A'}`)
    
    if (customer.accounts.length > 0) {
      console.log(`   Accounts:`)
      customer.accounts.forEach(account => {
        const balance = parseFloat(account.balance.toString()).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })
        console.log(`     • ${account.accountType}: ${account.accountNumber} - ${balance} (${account.status})`)
      })
    } else {
      console.log(`   Accounts: None`)
    }
  })

  console.log('\n' + '━'.repeat(100))
  console.log('\n💡 To generate luxury transactions for a customer, run:')
  console.log('   npx ts-node scripts/generate-luxury-transactions.ts <customerNumber> [targetBalance]')
  console.log('\n   Example:')
  console.log(`   npx ts-node scripts/generate-luxury-transactions.ts ${customers[0].customerNumber} 8600000`)
  console.log()
}

listCustomers()
  .catch((error) => {
    console.error('❌ Error:', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
