// CommonJS seed script to create test admin and customer
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...');

  // Hash password: "password123"
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. Create Test Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const admin = await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      gender: 'MALE',
      dateOfBirth: new Date('1985-03-10'),
      mobile: '5551111111',
      citizenship: 'United States',
      pan: 'ADMIN1234A',
      homeAddress: '999 Admin Plaza',
      adminNumber: 'ADM001',
      department: 'Operations',
      canApproveAccounts: true,
      canRestrictAccounts: true,
      canCreditDebit: true,
      canViewAllCustomers: true,
    },
  });

  console.log('\n✅ Test Admin Created:');
  console.log('   Email: admin@test.com');
  console.log('   Password: password123');
  console.log('   Admin Number:', admin.adminNumber);

  // 2. Create Test Customer
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'MALE',
      dateOfBirth: new Date('1990-01-15'),
      mobile: '5551234567',
      landline: '5559876543',
      ssn: '123456789',
      driversLicense: 'D1234567',
      citizenship: 'US Citizen',
      homeAddress: '123 Main Street',
      officeAddress: '456 Business Blvd',
      country: 'United States',
      state: 'CA',
      city: 'Los Angeles',
      zipCode: '90001',
      areaLocality: 'Los Angeles County',
      customerNumber: 'CUST001',
    },
  });

  // Create an ACTIVE account for the customer
  const account = await prisma.account.upsert({
    where: { accountNumber: '1000000001' },
    update: {},
    create: {
      customerId: customer.id,
      accountNumber: '1000000001',
      accountType: 'SAVING',
      status: 'ACTIVE',
      balance: 5000.00,
    },
  });

  // Create opening transaction
  await prisma.transaction.upsert({
    where: { transactionId: 'TXN001' },
    update: {},
    create: {
      accountId: account.id,
      transactionId: 'TXN001',
      type: 'OPENING',
      amount: 5000.00,
      balanceBefore: 0,
      balanceAfter: 5000.00,
      description: 'Account Opening - Initial Deposit',
      status: 'COMPLETED',
    },
  });

  console.log('✅ Test Customer Created:');
  console.log('   Email: customer@test.com');
  console.log('   Password: password123');
  console.log('   Account Number:', account.accountNumber);
  console.log('   Balance: $5,000.00');
  
  console.log('\n✨ All test users created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
