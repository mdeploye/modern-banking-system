// Test script to verify production database connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
    }
  }
})

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set')
    console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? '✅ Set' : '❌ Not set')
    
    // Try to connect
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Try a simple query
    const userCount = await prisma.user.count()
    console.log(`📊 Found ${userCount} users in database`)
    
    const adminCount = await prisma.admin.count()
    console.log(`👤 Found ${adminCount} admins in database`)
    
    console.log('\n✅ All database operations successful!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
