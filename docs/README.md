# 📚 Documentation Index

## Quick Links

### Getting Started
- [Quick Start Guide](./QUICKSTART.md) - Get running in 5 minutes
- [Development Guide](./DEVELOPMENT.md) - Development workflow and best practices
- [Test Credentials](./TEST_CREDENTIALS.md) - Test account login details

### Deployment
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md) - Pre and post-deployment tasks

### Configuration
- [Routes Documentation](./ROUTES.md) - Application route structure
- [Environment Variables](../.env.example) - Required configuration

### Development Notes
- [Development Notes](./development/) - Historical development documentation

## Project Structure

```
modern-banking-system/
├── docs/                      # Documentation
│   ├── development/          # Dev notes (gitignored)
│   ├── QUICKSTART.md
│   ├── DEPLOYMENT.md
│   └── TEST_CREDENTIALS.md
├── prisma/                    # Database schema
├── public/                    # Static assets
├── scripts/                   # Utility scripts
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── api/             # API routes
│   │   ├── admin/           # Admin dashboard
│   │   ├── customer/        # Customer portal
│   │   └── login/           # Authentication
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   └── lib/                 # Utilities
└── README.md                 # Main README

```

## Key Features

### Customer Portal
- Dual account management (Checking & Savings)
- Inter-account transfers
- Real-time transaction history
- Profile management
- Secure authentication

### Admin Dashboard
- Customer management
- Account approval
- Transaction oversight
- Credit/Debit operations
- Transaction history generator
- Account restrictions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **Deployment**: Vercel

## Support

For issues or questions:
1. Check existing documentation
2. Review code comments
3. Check console errors
4. Review Prisma schema for database structure

---

**Maintained By**: Development Team
**Last Updated**: 2025
