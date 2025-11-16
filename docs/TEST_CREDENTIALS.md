# 🔐 Test Credentials

## Quick Login Access

Your dev server is running at: **http://localhost:3001**

### Test Admin Account
```
Email: admin@test.com
Password: password123
```

### Test Customer Account
```
Email: customer@test.com
Password: password123
Account Number: 1000000001
Balance: $5,000.00
```

## Setup Test Accounts

If the test accounts don't exist yet, run:

```bash
npx ts-node seed-test-users.ts
```

This will create both admin and customer test accounts with the credentials above.

## Login Instructions

1. Go to **http://localhost:3001/login**
2. Click the tab for **Customer** or **Admin**
3. Enter credentials above
4. Click "Log In"

## Troubleshooting Login Issues

### If login page won't load:
```bash
# Hard refresh browser (clear cache)
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or restart dev server
npm run dev
```

### If login fails with "Invalid credentials":
```bash
# Re-seed test users
npx ts-node seed-test-users.ts
```

### If you see hydration errors:
```bash
# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

### Check if test accounts exist:
```bash
# Open Prisma Studio
npx prisma studio

# Navigate to "users" table
# Look for admin@test.com and customer@test.com
```

## Console Warnings Explained

The warnings you see are **normal and safe to ignore**:

- **InstallTrigger deprecated** - Firefox warning, doesn't affect functionality
- **SES Removing intrinsics** - Security hardening, working as intended
- **Script loading failed** - Hot reload artifact, refresh page if persists
- **Source map error** - Development warning, doesn't affect app
- **Preload warning** - Performance optimization hint, not critical

## What Works Now

✅ **Dev server running** on http://localhost:3001
✅ **Login page accessible** at /login
✅ **Transaction generator fixed** (both terminal and UI)
✅ **Clean build** (cache cleared)

## Next Steps

1. **Hard refresh your browser** (Cmd+Shift+R)
2. Try logging in with credentials above
3. If login fails, run: `npx ts-node seed-test-users.ts`
4. Test the transaction generator from Admin Dashboard

---

**Need to create more test accounts?** Check `seed-test-users.ts` for the template.
