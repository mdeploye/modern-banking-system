import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
const { hash } = bcryptjs

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Checking admin account...')

  // Create or update Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@banking.com' },
    update: {},
    create: {
      email: 'admin@banking.com',
      password: await hash('makeusPr0ud', 12),
      role: 'ADMIN',
    },
  })

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
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

  console.log('✅ Admin account ready!')
  console.log('\n📝 Admin Login Credentials:')
  console.log('Email: admin@banking.com')
  console.log('Password: makeusPr0ud')
  console.log('\n🌐 Production Login:')
  console.log('https://modern-banking-system-4tjnt4l9w-cgrades-projects.vercel.app/login')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
