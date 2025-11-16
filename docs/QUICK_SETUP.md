# Quick Setup Guide - Fix Registration Issue

## 🔴 **Issue**: Registration Failed
The registration is failing because the database schema hasn't been migrated to include the new restriction fields and ADMIN role changes.

## ✅ **Solution**: Run Migration

### Option 1: Direct SQL Migration (RECOMMENDED - FASTEST)

1. **Connect to your PostgreSQL database:**
```bash
psql -U grade -d banking_db
```

2. **Run the migration script:**
```bash
\i /Users/grade/Desktop/gig/modern-banking-system/migration.sql
```

3. **Verify the migration:**
```sql
-- Check if new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name LIKE '%restrict%';

-- Check Role enum
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'Role'::regtype;
```

4. **Generate Prisma client:**
```bash
cd /Users/grade/Desktop/gig/modern-banking-system
npx prisma generate
```

5. **Restart your dev server:**
```bash
npm run dev
```

### Option 2: Using Prisma Migrate (Requires Confirmation)

The interactive prompts are waiting. Answer 'y' to both:

1. **Terminal window with first command:**
```
? Are you sure you want to create and apply this migration? › y
```

2. **Terminal window with second command:**
```
? Do you want to ignore the warning(s)? › y
```

Then run:
```bash
npx prisma generate
npm run dev
```

## 📝 **What Was Changed**

### Database Schema:
1. ✅ `customers` table - Added restriction fields:
   - `isRestricted` (Boolean)
   - `restrictionType` (Text)
   - `restrictionReason` (Text)
   - `restrictedBy` (Text)
   - `restrictedAt` (Timestamp)
   - `restrictionExpiry` (Timestamp)

2. ✅ `staff` table → `admins` table
   - Renamed table
   - Added permission columns
   - `staffNumber` → `adminNumber`

3. ✅ `audit_logs` table
   - `staffId` → `adminId`

4. ✅ `Role` enum
   - Removed `STAFF`
   - Kept `CUSTOMER` and `ADMIN`

## 🧪 **Test Registration After Migration**

1. **Navigate to:** http://localhost:3000/register

2. **Fill out the registration form with:**
   - Email: test@example.com
   - Password: password123
   - First Name: Test
   - Last Name: User
   - Mobile: 1234567890
   - PAN: ABCDE1234F
   - Aadhaar: 123456789012
   - Date of Birth: 1990-01-01
   - Other required fields...

3. **Expected Result:**
   ```json
   {
     "message": "Registration successful. Your account is pending approval.",
     "customerNumber": "CUST...",
     "accountNumber": "..."
   }
   ```

## 🔒 **New Admin APIs Available**

After migration, these endpoints are ready:

### 1. Credit Account
```bash
POST /api/admin/credit
{
  "accountNumber": "1234567890",
  "amount": 1000,
  "description": "Initial deposit",
  "remark": "Optional remark"
}
```

### 2. Debit Account
```bash
POST /api/admin/debit
{
  "accountNumber": "1234567890",
  "amount": 500,
  "description": "Withdrawal correction",
  "remark": "Optional remark"
}
```

### 3. Restrict Account
```bash
POST /api/admin/restrict-account
{
  "customerNumber": "CUST12345",
  "restrictionType": "TRANSFER_BLOCKED",
  "restrictionReason": "Suspicious activity detected",
  "expiryDate": "2025-12-31" // Optional
}
```

Restriction Types:
- `WITHDRAWAL_LIMIT`
- `TRANSFER_BLOCKED`
- `FROZEN`
- `PENDING_VERIFICATION`
- `SUSPICIOUS_ACTIVITY`

### 4. Unrestrict Account
```bash
POST /api/admin/unrestrict-account
{
  "customerNumber": "CUST12345",
  "reason": "Issue resolved, identity verified"
}
```

### 5. Get Admin Stats
```bash
GET /api/admin/stats
```

Response:
```json
{
  "pendingApprovals": 5,
  "totalCustomers": 120,
  "activeAccounts": 115,
  "restrictedAccounts": 3
}
```

## 🎨 **Updated Pages**

### Customer Side:
- ✅ Login page (Customer/Admin tabs)
- ✅ Registration (unchanged, will work after migration)
- ✅ Customer Dashboard (shows restriction modal if restricted)

### Admin Side:
- ✅ Admin Dashboard (`/admin/dashboard`)
- ✅ Login page Admin tab
- 🔨 Credit/Debit pages (coming soon)
- 🔨 Restriction management page (coming soon)

## 🚨 **Common Issues**

### Issue: "Column does not exist"
**Solution:** Run the migration SQL script

### Issue: "Role STAFF does not exist"
**Solution:** The migration updates existing STAFF users to ADMIN automatically

### Issue: "Cannot read property 'customer'"
**Solution:** Run `npx prisma generate` after migration

### Issue: Still seeing registration errors
**Solution:** 
1. Check terminal for specific error
2. Ensure migration completed
3. Restart dev server
4. Clear browser cache

## 📊 **Verify Migration Success**

Run this query in PostgreSQL:
```sql
-- Check customers table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Check if admins table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'admins'
);

-- Check Role enum values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'Role'::regtype
ORDER BY enumlabel;
```

Expected results:
- `customers` table has `isRestricted`, `restrictionType`, etc.
- `admins` table exists
- Role enum has `ADMIN` and `CUSTOMER` only

## ✨ **Next Steps After Migration**

1. ✅ Test customer registration
2. ✅ Test customer login
3. ✅ Create an admin user (via SQL or API)
4. ✅ Test admin login
5. ✅ Test admin APIs (credit, debit, restrict)
6. ✅ Test restriction modal for customers

## 📞 **Need Help?**

Check these files for more info:
- `AUTH_SYSTEM_REVIEW.md` - Full auth documentation
- `IMPLEMENTATION_SUMMARY.md` - All changes made
- `CANVAS_DESIGN.md` - Design system
- `ROUTES.md` - All routes and endpoints

---

**Status:** Ready to migrate ✅  
**Time to fix:** ~2 minutes  
**Complexity:** Low (automated SQL script)
