# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use free Vercel Postgres)

## Setup Steps

### 1. Install Dependencies
```bash
cd modern-banking-system
npm install
```

### 2. Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Generate a secret key
openssl rand -base64 32

# Edit .env and update:
# - DATABASE_URL with your PostgreSQL connection string
# - NEXTAUTH_SECRET with the generated secret
# - NEXTAUTH_URL (http://localhost:3000 for local dev)
```

### 3. Setup Database

#### Option A: Local PostgreSQL
```bash
# Create database
createdb banking_db

# Update .env
DATABASE_URL="postgresql://localhost:5432/banking_db?schema=public"

# Initialize database
npx prisma db push
npx prisma generate
```

#### Option B: Free Vercel Postgres
```bash
# 1. Go to https://vercel.com/dashboard
# 2. Create new project
# 3. Add Postgres database from Storage tab
# 4. Copy connection string to .env as DATABASE_URL
# 5. Run:
npx prisma db push
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## What's Next?

### Register Your First Account
1. Click "Open Account" on homepage
2. Fill in the registration form
3. Submit application

### Login as Staff (To Approve Accounts)
Since staff accounts need to be created manually:

```bash
# Open Prisma Studio
npx prisma studio

# Create a staff user:
# 1. In Users table, create new user:
#    - email: staff@example.com
#    - password: (use bcrypt hash of your password)
#    - role: STAFF
# 2. In Staff table, create corresponding staff record
```

Or use this Node.js script to create a staff account:

```bash
# Create scripts/create-staff.ts
node -e "
const bcrypt = require('bcryptjs');
console.log('Hashed password:', bcrypt.hashSync('staff123', 10));
"
```

### Test the Application
- ✅ Register as customer
- ✅ Login as customer
- ✅ View dashboard
- ✅ Apply for debit card
- ✅ Add beneficiaries
- ✅ Transfer funds

## Database Management

### View Data
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create Sample Data
You can manually add test data through Prisma Studio or create seed scripts.

## Deployment

### Deploy to Vercel (Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Build failed"
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Development Tips

### Hot Reload
- Save any file and see changes instantly
- Database changes require `npx prisma generate`

### View Logs
- Check terminal for server logs
- Check browser console for client logs

### Test Authentication
- Use browser incognito mode for fresh sessions
- Clear cookies if having issues

## Features to Test

### Customer Portal
- [x] Registration
- [x] Login/Logout
- [ ] Profile management
- [ ] Fund transfer
- [ ] Transaction history
- [ ] Beneficiary management
- [ ] Debit card application

### Staff Portal
- [ ] Login
- [ ] Approve accounts
- [ ] View customers
- [ ] Credit accounts
- [ ] Delete accounts

## Next Steps

1. **Complete Implementation**
   - Build customer dashboard pages
   - Build staff dashboard pages
   - Implement API routes
   - Add form validations

2. **Enhance Features**
   - Add email notifications
   - Add SMS OTP
   - Generate PDF statements
   - Add transaction limits

3. **Deploy to Production**
   - Follow DEPLOYMENT.md
   - Set up monitoring
   - Configure custom domain

## Resources

- 📖 [Full Documentation](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🛠️ [Development Guide](./DEVELOPMENT.md)
- 💬 [GitHub Issues](https://github.com/yourusername/modern-banking-system/issues)

## Need Help?

- Check the documentation
- Review code comments
- Open an issue on GitHub
- Check console for errors

---

**Ready to start developing?** 🚀

```bash
npm run dev
```

Then open http://localhost:3000 and start building!
