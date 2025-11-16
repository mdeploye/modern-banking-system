-- Migration Script: Convert STAFF to ADMIN and Add Restriction Fields
-- Run this script in your PostgreSQL database

-- Step 1: Add new restriction columns to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS "isRestricted" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "restrictionType" TEXT,
ADD COLUMN IF NOT EXISTS "restrictionReason" TEXT,
ADD COLUMN IF NOT EXISTS "restrictedBy" TEXT,
ADD COLUMN IF NOT EXISTS "restrictedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "restrictionExpiry" TIMESTAMP(3);

-- Step 2: Rename staff table to admins (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'staff') THEN
        ALTER TABLE staff RENAME TO admins;
    END IF;
END $$;

-- Step 3: Add admin permission columns (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins') THEN
        ALTER TABLE admins
        ADD COLUMN IF NOT EXISTS "canApproveAccounts" BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS "canRestrictAccounts" BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS "canCreditDebit" BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS "canViewAllCustomers" BOOLEAN DEFAULT true;
        
        -- Rename staffNumber to adminNumber if it exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'staffNumber') THEN
            ALTER TABLE admins RENAME COLUMN "staffNumber" TO "adminNumber";
        END IF;
    END IF;
END $$;

-- Step 4: Update audit_logs table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Rename staffId to adminId if it exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'staffId') THEN
            ALTER TABLE audit_logs RENAME COLUMN "staffId" TO "adminId";
        END IF;
    END IF;
END $$;

-- Step 5: Update Role enum - remove STAFF, keep ADMIN
-- First, update any existing STAFF users to ADMIN
UPDATE users SET role = 'ADMIN' WHERE role = 'STAFF';

-- Step 6: Drop and recreate the Role enum
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

ALTER TABLE users ALTER COLUMN role TYPE "Role" USING role::text::"Role";

DROP TYPE "Role_old";

-- Step 7: Update foreign key constraints for audit_logs if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_name = 'admins') THEN
        -- Drop old constraint if exists
        ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS "audit_logs_staffId_fkey";
        
        -- Add new constraint
        ALTER TABLE audit_logs
        ADD CONSTRAINT "audit_logs_adminId_fkey" 
        FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 8: Update user relations for admins
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins') THEN
        -- The foreign key should already exist, but ensure it's correct
        ALTER TABLE admins DROP CONSTRAINT IF EXISTS "admins_userId_fkey";
        ALTER TABLE admins
        ADD CONSTRAINT "admins_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Done! Your database is now updated
SELECT 'Migration completed successfully!' as status;
