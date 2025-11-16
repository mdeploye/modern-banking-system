# 🚀 Deployment Checklist

## Pre-Deployment

### 1. Code Quality
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] No critical console.logs in production code
- [ ] Environment variables properly configured
- [ ] .gitignore updated and working
- [ ] All dependencies up to date

### 2. Security
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] Database connection uses SSL in production
- [ ] No sensitive data in git history
- [ ] Rate limiting configured (if implemented)
- [ ] CORS policies reviewed

### 3. Database
- [ ] Production database created
- [ ] Prisma schema pushed (`npx prisma db push`)
- [ ] Seed data added (if needed)
- [ ] Database backups configured
- [ ] Connection pooling enabled

### 4. Environment Variables
- [ ] All required environment variables set in Vercel/hosting platform
- [ ] NEXTAUTH_URL points to production domain
- [ ] DATABASE_URL contains production connection string
- [ ] Public variables prefixed with NEXT_PUBLIC_

## Deployment Steps

### Vercel Deployment (Recommended)

#### 1. Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

#### 2. Configure Environment Variables
Go to Vercel Dashboard → Project → Settings → Environment Variables

Add all variables from `.env.production.example`:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BANK_IFSC`
- `NEXT_PUBLIC_BANK_BRANCH`

#### 3. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Alternative: Manual Deployment

#### Build for Production
```bash
npm run build
npm start
```

#### Using PM2 (for VPS)
```bash
npm install -g pm2
pm2 start npm --name "banking-app" -- start
pm2 save
pm2 startup
```

## Post-Deployment

### 1. Verification
- [ ] Application loads successfully
- [ ] Customer registration works
- [ ] Admin login works
- [ ] Transactions process correctly
- [ ] Images load properly
- [ ] All routes accessible

### 2. Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Enable database monitoring

### 3. Testing
- [ ] Create test admin account
- [ ] Create test customer account
- [ ] Perform test transaction
- [ ] Verify email notifications (if enabled)
- [ ] Test mobile responsiveness

### 4. Security Hardening
- [ ] Enable HTTPS only
- [ ] Configure CSP headers
- [ ] Enable rate limiting
- [ ] Review API permissions
- [ ] Set up audit logging

## Rollback Plan

If deployment fails:

1. **Vercel**: Revert to previous deployment in dashboard
2. **Manual**: Keep previous build folder as backup
3. **Database**: Have migration rollback scripts ready

## Production URLs

After deployment, update these:
- Production URL: `https://your-domain.com`
- Admin Panel: `https://your-domain.com/admin/dashboard`
- Customer Portal: `https://your-domain.com/customer/dashboard`

## Support & Maintenance

### Regular Tasks
- Weekly database backups
- Monthly dependency updates
- Quarterly security audits
- Monitor error logs daily

### Emergency Contacts
- Database Admin: [contact]
- DevOps Team: [contact]
- Security Team: [contact]

## Documentation Links

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Quick Start](./docs/QUICKSTART.md)
- [Test Credentials](./docs/TEST_CREDENTIALS.md)

---

**Last Updated**: [Current Date]
**Deployment Status**: ⏳ Pending / ✅ Deployed / ❌ Failed
