# 🚀 Deployment Guide

## Deploy to Vercel (Recommended)

### Quick Deploy Button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/modern-banking-system)

### Manual Deployment Steps

#### 1. Prerequisites
- GitHub account
- Vercel account (free tier available)
- Git installed locally

#### 2. Prepare Your Repository
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/modern-banking-system.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

##### Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   DATABASE_URL=your_postgres_connection_string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_generated_secret
   NEXT_PUBLIC_APP_NAME=Modern Banking System
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BANK_IFSC=BNKJ0001011
   NEXT_PUBLIC_BANK_BRANCH=Main Branch
   ```

6. Click **"Deploy"**

##### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (this will create a preview deployment)
vercel

# Follow prompts to link to existing project or create new one

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Deploy to production
vercel --prod
```

#### 4. Setup Database

##### Option A: Vercel Postgres (Recommended)
1. In your Vercel project dashboard, go to **"Storage"**
2. Click **"Create Database"** → **"Postgres"**
3. Copy the connection string
4. Add it to environment variables as `DATABASE_URL`
5. Run migrations:
```bash
# From your local machine
DATABASE_URL="your_vercel_postgres_url" npx prisma db push
```

##### Option B: External PostgreSQL (Supabase, Railway, etc.)
1. Create a PostgreSQL database on your preferred provider
2. Get the connection string
3. Add to Vercel environment variables
4. Run migrations as shown above

#### 5. Verify Deployment
1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test the homepage loads
3. Try registering a new account
4. Check database that data is being saved

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_NAME` | Display name | `Modern Banking System` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_BANK_IFSC` | Bank IFSC code | `BNKJ0001011` |
| `NEXT_PUBLIC_BANK_BRANCH` | Branch name | `Main Branch` |

## Alternative Deployment Options

### Deploy to Netlify

1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

2. **Add Plugin**:
   Install `@netlify/plugin-nextjs`:
   ```bash
   npm install -D @netlify/plugin-nextjs
   ```

3. **netlify.toml**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

### Deploy to Railway

1. Create new project on [Railway](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL database from Railway catalog
4. Set environment variables
5. Deploy automatically on push

### Deploy to AWS (Advanced)

1. Use AWS Amplify for hosting
2. RDS for PostgreSQL
3. CloudFront for CDN
4. Configure build settings similar to Vercel

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Database connected
- [ ] User registration works
- [ ] Login works
- [ ] Environment variables are set
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)
- [ ] Error tracking setup (optional: Sentry)
- [ ] Analytics setup (optional: Vercel Analytics)

## Continuous Deployment

Vercel automatically deploys on every push to main branch:
- **Preview Deployments**: Every PR gets a unique preview URL
- **Production Deployments**: Automatic on merge to main
- **Rollback**: Easy rollback to previous deployments in dashboard

## Database Migrations

### Initial Setup
```bash
# Push schema to database
npx prisma db push
```

### Future Changes
```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Apply to production
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployment status
- View real-time logs
- Check analytics
- Manage environment variables

### Database Management
```bash
# View database in GUI
npx prisma studio
```

### Backup Strategy
1. Enable automated backups in your database provider
2. Regular exports via `pg_dump` (PostgreSQL)
3. Store backups in separate location (S3, etc.)

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building locally
npm run build
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL mode is configured if required
- Test connection locally first

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names (exact match, case-sensitive)
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

## Security Best Practices

1. **Never commit `.env` file**
2. **Rotate secrets regularly**
3. **Use separate databases** for development/production
4. **Enable Vercel's security features**:
   - DDoS protection (automatic)
   - Automatic HTTPS (automatic)
   - Security headers
5. **Set up monitoring** for suspicious activity

## Performance Optimization

- Enable Vercel Edge Functions for API routes
- Use ISR (Incremental Static Regeneration) where applicable
- Optimize images with Next.js Image component
- Enable Vercel Analytics
- Configure caching headers

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Need help?** Open an issue on GitHub or contact support.
