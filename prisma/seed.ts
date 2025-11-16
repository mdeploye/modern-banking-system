import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with US standard data...')

  // Create Admin User
  console.log('Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: await hash('password123', 12),
      role: 'ADMIN',
    },
  })

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      gender: 'MALE',
      dateOfBirth: new Date('1985-01-01'),
      mobile: '5551234567',
      adminNumber: 'ADM0000000001',
      department: 'Operations',
      citizenship: 'US Citizen',
      canApproveAccounts: true,
      canRestrictAccounts: true,
      canCreditDebit: true,
      canViewAllCustomers: true,
      homeAddress: '100 Admin Street, Suite 500',
      pan: 'ADMIN12345',
    },
  })

  // Create Customer User
  console.log('Creating customer user with US standard data...')
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      password: await hash('password123', 12),
      role: 'CUSTOMER',
    },
  })

  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'MALE',
      dateOfBirth: new Date('1990-05-15'),
      mobile: '5559876543',
      ssn: '123456789',
      driversLicense: 'D1234567',
      citizenship: 'US Citizen',
      homeAddress: '123 Main Street, Apt 4B',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      zipCode: '90001',
      areaLocality: 'Los Angeles County',
      customerNumber: 'CUST0000000001',
    },
  })

  // Create Checking Account (ACTIVE)
  console.log('Creating accounts...')
  const checkingAccount = await prisma.account.create({
    data: {
      customerId: customer.id,
      accountNumber: '1000000001',
      accountType: 'CURRENT',
      status: 'ACTIVE',
      balance: 5000.00,
    },
  })

  // Create Savings Account (ACTIVE)
  const savingsAccount = await prisma.account.create({
    data: {
      customerId: customer.id,
      accountNumber: '1000000002',
      accountType: 'SAVING',
      status: 'ACTIVE',
      balance: 10000.00,
    },
  })

  // Create some sample transactions
  console.log('Creating sample transactions...')
  await prisma.transaction.create({
    data: {
      accountId: checkingAccount.id,
      transactionId: `TXN${Date.now()}001`,
      type: 'OPENING',
      amount: 5000,
      balanceBefore: 0,
      balanceAfter: 5000,
      description: 'Checking Account Opening Deposit',
      status: 'COMPLETED',
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: savingsAccount.id,
      transactionId: `TXN${Date.now()}002`,
      type: 'OPENING',
      amount: 10000,
      balanceBefore: 0,
      balanceAfter: 10000,
      description: 'Savings Account Opening Deposit',
      status: 'COMPLETED',
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log('\n📝 Test Accounts:')
  console.log('Admin: admin@test.com / password123')
  console.log('Customer: customer@test.com / password123')
  console.log('\nCustomer Accounts:')
  console.log(`Checking: ${checkingAccount.accountNumber} ($5,000.00)`)
  console.log(`Savings: ${savingsAccount.accountNumber} ($10,000.00)`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
