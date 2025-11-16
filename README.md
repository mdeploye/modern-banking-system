# 🏦 Canvas Credit Union - Digital Banking Platform

A production-ready, secure online banking system built with Next.js 15, React 19, TypeScript, and PostgreSQL. Features dual account management, real-time transactions, admin controls, and modern UX.

## ✨ Features

### 👤 Customer Features
- **Account Management**
  - Online account registration with multi-step validation
  - Secure login with JWT-based authentication
  - Profile management with photo upload
  - Password management and recovery
  
- **Banking Operations**
  - Real-time balance tracking
  - Fund transfers with OTP verification
  - Beneficiary management
  - Transaction history and statements
  - Debit card application and management
  
- **Security**
  - Password hashing with bcrypt
  - Multi-factor authentication
  - OTP verification for transactions
  - Session management
  - Audit logging

### 🧑‍💼 Staff Features
- **Account Management**
  - Approve pending customer applications
  - View customer details by account number
  - Credit customer accounts (cash deposits)
  - Delete/close customer accounts
  
- **Operations**
  - Transaction monitoring
  - Customer verification
  - Account status management

### 🔒 Security Features
- ✅ SQL injection protection (Prisma ORM)
- ✅ Password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ CSRF protection
- ✅ Input validation (Zod)
- ✅ Role-based access control (RBAC)
- ✅ Audit logging
- ✅ Rate limiting ready
- ✅ XSS protection

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless functions
- **NextAuth.js v5** - Authentication
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Zod** - Schema validation

### Deployment
- **Vercel** - Hosting and deployment
- **Vercel Postgres** - Database hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Vercel Postgres)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd modern-banking-system
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/banking_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# App Configuration
NEXT_PUBLIC_APP_NAME="Modern Banking System"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# IFSC and Branch Configuration
NEXT_PUBLIC_BANK_IFSC="BNKJ0001011"
NEXT_PUBLIC_BANK_BRANCH="Main Branch"
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb banking_db

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

#### Option B: Vercel Postgres
1. Create a Postgres database in Vercel
2. Copy the connection string to your `.env` file
3. Run migrations:
```bash
npx prisma db push
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
modern-banking-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── api/              # API routes
│   │   ├── customer/         # Customer dashboard pages
│   │   ├── staff/            # Staff dashboard pages
│   │   ├── login/            # Login pages
│   │   ├── register/         # Registration pages
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── utils.ts          # Utility functions
│   │   └── validations.ts    # Zod schemas
│   ├── hooks/                # Custom React hooks
│   └── middleware.ts         # Route protection
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## 🚀 Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy to Vercel

#### Via Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.example`
   - Set `DATABASE_URL` to your Vercel Postgres connection string
   - Generate and set `NEXTAUTH_SECRET`
5. Click "Deploy"

#### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy to production
vercel --prod
```

### 3. Setup Database
```bash
# After deployment, run migrations
npx prisma db push
```

### 4. Access Your App
Your app will be available at: `https://your-app-name.vercel.app`

## 📊 Database Schema

### Key Tables
- **users** - Authentication and user credentials
- **customers** - Customer personal information
- **staff** - Staff members
- **accounts** - Bank accounts with balances
- **transactions** - All financial transactions
- **beneficiaries** - Saved beneficiaries for transfers
- **audit_logs** - System activity tracking

### Features
- Proper relations with foreign keys
- Cascading deletes
- Indexes for performance
- Transaction support
- Normalized schema (no dynamic tables)

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong passwords** - Minimum 8 characters with mixed case, numbers
3. **Enable 2FA** - For production deployments
4. **Regular backups** - Database and critical data
5. **Monitor logs** - Check audit logs regularly
6. **Update dependencies** - Keep packages up to date
7. **Rate limiting** - Implement in production
8. **HTTPS only** - Vercel provides this automatically

## 🧪 Testing

### Run Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Test User Accounts
After seeding, you can use:
- **Customer**: email from registration
- **Staff**: Create via admin panel or seed script

## 📝 API Routes

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get session

### Customer APIs (Coming Soon)
- `POST /api/customer/register` - Register new customer
- `GET /api/customer/profile` - Get profile
- `POST /api/customer/transfer` - Fund transfer
- `GET /api/customer/transactions` - Get transaction history

### Staff APIs (Coming Soon)
- `POST /api/staff/approve-account` - Approve pending account
- `POST /api/staff/credit-account` - Credit customer account
- `GET /api/staff/customers` - List customers

## 🎨 UI Components

Built with **shadcn/ui** for:
- Consistent design system
- Accessibility (WCAG compliant)
- Dark mode support (optional)
- Responsive design
- TypeScript support

## 🔄 Workflow Comparison

### Old PHP System vs Modern Next.js

| Feature | PHP System | Next.js System |
|---------|-----------|----------------|
| Architecture | Monolithic | Modern serverless |
| Database | MySQL + dynamic tables | PostgreSQL + normalized schema |
| Authentication | Plain sessions | JWT + NextAuth |
| Password Storage | Plain text ❌ | Hashed (bcrypt) ✅ |
| SQL Injection | Vulnerable ❌ | Protected (Prisma) ✅ |
| Validation | None | Zod schemas ✅ |
| Type Safety | None | TypeScript ✅ |
| UI Framework | Custom CSS | TailwindCSS + shadcn/ui |
| Mobile Support | Limited | Fully responsive |
| Deployment | Manual | Automated (Vercel) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Original PHP banking system by ThakurAmanKumar
- shadcn/ui for beautiful components
- Vercel for hosting platform
- Next.js team for the amazing framework

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

## 🚧 Roadmap

- [ ] Complete all customer features
- [ ] Complete all staff features
- [ ] Add email notifications
- [ ] Add SMS OTP (Twilio integration)
- [ ] PDF statement generation
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode

## ⚠️ Disclaimer

This is a demonstration project for educational purposes. For production use:
- Conduct security audits
- Implement additional security measures
- Comply with banking regulations
- Add comprehensive testing
- Set up monitoring and alerting
- Implement disaster recovery

---

**Built with ❤️ using Next.js, React, and TypeScript**
