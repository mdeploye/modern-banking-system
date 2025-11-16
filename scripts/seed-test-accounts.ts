import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test accounts...')

  // Hash password: "password123"
  const hashedPassword = await hash('password123', 12)

  // Create Admin User
  console.log('Creating admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const admin = await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      adminNumber: 'ADM0000000001',
      mobile: '1234567890',
      gender: 'MALE',
      department: 'Administration',
      dateOfBirth: new Date('1985-01-01'),
      citizenship: 'US Citizen',
      pan: 'ADMIN1234A',
      homeAddress: '1 Admin Street, New York',
    },
  })

  console.log('✅ Admin created:', adminUser.email)

  // Create Customer User 1
  console.log('Creating customer user 1...')
  const customerUser1 = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  })

  const customer1 = await prisma.customer.upsert({
    where: { userId: customerUser1.id },
    update: {},
    create: {
      userId: customerUser1.id,
      firstName: 'Test',
      lastName: 'Customer',
      customerNumber: 'CUST0000000001',
      gender: 'MALE',
      dateOfBirth: new Date('1990-01-01'),
      mobile: '5559876543',
      ssn: '123456789',
      driversLicense: 'D1234567',
      citizenship: 'US Citizen',
      homeAddress: '123 Test Street',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      zipCode: '90001',
      areaLocality: 'Test Area',
    },
  })

  // Create CHECKING account for Customer 1
  const checking1 = await prisma.account.upsert({
    where: { accountNumber: '1000000001' },
    update: {},
    create: {
      customerId: customer1.id,
      accountNumber: '1000000001',
      accountType: 'CURRENT', // Checking
      status: 'ACTIVE',
      balance: 7500, // Starting balance: $7,500
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: checking1.id,
      transactionId: `TXN${Date.now()}CHK1`,
      type: 'OPENING',
      amount: 7500,
      balanceBefore: 0,
      balanceAfter: 7500,
      description: 'Checking account opening balance',
      status: 'COMPLETED',
    },
  })

  // Create SAVINGS account for Customer 1
  const savings1 = await prisma.account.upsert({
    where: { accountNumber: '1000000002' },
    update: {},
    create: {
      customerId: customer1.id,
      accountNumber: '1000000002',
      accountType: 'SAVING',
      status: 'ACTIVE',
      balance: 15000, // Starting balance: $15,000
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: savings1.id,
      transactionId: `TXN${Date.now()}SAV1`,
      type: 'OPENING',
      amount: 15000,
      balanceBefore: 0,
      balanceAfter: 15000,
      description: 'Savings account opening balance',
      status: 'COMPLETED',
    },
  })

  console.log('✅ Customer 1 created:', customerUser1.email)
  console.log('   Checking:', checking1.accountNumber, '- Balance: $7,500')
  console.log('   Savings:', savings1.accountNumber, '- Balance: $15,000')

  // Create Customer User 2 (for transfers)
  console.log('Creating customer user 2...')
  const customerUser2 = await prisma.user.upsert({
    where: { email: 'customer2@test.com' },
    update: {},
    create: {
      email: 'customer2@test.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  })

  const customer2 = await prisma.customer.upsert({
    where: { userId: customerUser2.id },
    update: {},
    create: {
      userId: customerUser2.id,
      firstName: 'Second',
      lastName: 'Customer',
      customerNumber: 'CUST0000000002',
      gender: 'FEMALE',
      dateOfBirth: new Date('1992-05-15'),
      mobile: '5559876544',
      ssn: '234567890',
      driversLicense: 'D2345678',
      citizenship: 'US Citizen',
      homeAddress: '456 Test Avenue',
      country: 'United States',
      state: 'New York',
      city: 'New York',
      zipCode: '10001',
      areaLocality: 'Test Area 2',
    },
  })

  // Create CHECKING account for Customer 2
  const checking2 = await prisma.account.upsert({
    where: { accountNumber: '1000000003' },
    update: {},
    create: {
      customerId: customer2.id,
      accountNumber: '1000000003',
      accountType: 'CURRENT', // Checking
      status: 'ACTIVE',
      balance: 3000, // Starting balance: $3,000
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: checking2.id,
      transactionId: `TXN${Date.now()}CHK2`,
      type: 'OPENING',
      amount: 3000,
      balanceBefore: 0,
      balanceAfter: 3000,
      description: 'Checking account opening balance',
      status: 'COMPLETED',
    },
  })

  // Create SAVINGS account for Customer 2
  const savings2 = await prisma.account.upsert({
    where: { accountNumber: '1000000004' },
    update: {},
    create: {
      customerId: customer2.id,
      accountNumber: '1000000004',
      accountType: 'SAVING',
      status: 'ACTIVE',
      balance: 8000, // Starting balance: $8,000
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: savings2.id,
      transactionId: `TXN${Date.now()}SAV2`,
      type: 'OPENING',
      amount: 8000,
      balanceBefore: 0,
      balanceAfter: 8000,
      description: 'Savings account opening balance',
      status: 'COMPLETED',
    },
  })

  console.log('✅ Customer 2 created:', customerUser2.email)
  console.log('   Checking:', checking2.accountNumber, '- Balance: $3,000')
  console.log('   Savings:', savings2.accountNumber, '- Balance: $8,000')

  // Create Pending Account (for approval testing)
  console.log('Creating pending account...')
  const pendingUser = await prisma.user.upsert({
    where: { email: 'pending@test.com' },
    update: {},
    create: {
      email: 'pending@test.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  })

  const pendingCustomer = await prisma.customer.upsert({
    where: { userId: pendingUser.id },
    update: {},
    create: {
      userId: pendingUser.id,
      firstName: 'Pending',
      lastName: 'User',
      customerNumber: 'CUST0000000003',
      gender: 'OTHER',
      dateOfBirth: new Date('1995-08-20'),
      mobile: '5559876545',
      ssn: '345678901',
      driversLicense: 'D3456789',
      citizenship: 'US Citizen',
      homeAddress: '789 Test Road',
      country: 'United States',
      state: 'Texas',
      city: 'Houston',
      zipCode: '77001',
      areaLocality: 'Test Area 3',
    },
  })

  // Create pending CHECKING account
  await prisma.account.upsert({
    where: { accountNumber: '1000000005' },
    update: {},
    create: {
      customerId: pendingCustomer.id,
      accountNumber: '1000000005',
      accountType: 'CURRENT',
      status: 'PENDING', // Pending approval
      balance: 0,
    },
  })

  // Create pending SAVINGS account
  await prisma.account.upsert({
    where: { accountNumber: '1000000006' },
    update: {},
    create: {
      customerId: pendingCustomer.id,
      accountNumber: '1000000006',
      accountType: 'SAVING',
      status: 'PENDING', // Pending approval
      balance: 0,
    },
  })

  console.log('✅ Pending accounts created:', pendingUser.email)
  console.log('   Checking: 1000000005 (PENDING)')
  console.log('   Savings: 1000000006 (PENDING)')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Test Accounts Created:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:')
  console.log('  Email: admin@test.com')
  console.log('  Password: password123')
  console.log('\nCustomer 1 (Active):')
  console.log('  Email: customer@test.com')
  console.log('  Password: password123')
  console.log('  Checking: 1000000001 (1000 0000 01) - $7,500.00')
  console.log('  Savings:  1000000002 (1000 0000 02) - $15,000.00')
  console.log('  Total Balance: $22,500.00')
  console.log('\nCustomer 2 (Active):')
  console.log('  Email: customer2@test.com')
  console.log('  Password: password123')
  console.log('  Checking: 1000000003 (1000 0000 03) - $3,000.00')
  console.log('  Savings:  1000000004 (1000 0000 04) - $8,000.00')
  console.log('  Total Balance: $11,000.00')
  console.log('\nCustomer 3 (Pending Approval):')
  console.log('  Email: pending@test.com')
  console.log('  Password: password123')
  console.log('  Checking: 1000000005 (1000 0000 05) - PENDING')
  console.log('  Savings:  1000000006 (1000 0000 06) - PENDING')
  console.log('\n💡 Routing Number: 302 075 830 (same for all accounts)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
