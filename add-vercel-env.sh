#!/bin/bash

# Script to add all required environment variables to Vercel
# Run this with: bash add-vercel-env.sh

echo "🔧 Adding environment variables to Vercel..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production URL
PROD_URL="https://modern-banking-system-a5labm8fi-cgrades-projects.vercel.app"

# Database URL (using Supabase Prisma URL)
DATABASE_URL="postgres://postgres.uwcgadsritvczxsjnyse:g5rYT0xgnq1Ut167@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# NextAuth Secret (the one from your .env.production.example)
NEXTAUTH_SECRET="bZ1R2qsChuec2eHmnvI8ri1zlW16K0iMmM7qOCRdsug="

echo -e "${BLUE}Adding DATABASE_URL...${NC}"
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

echo -e "${BLUE}Adding NEXTAUTH_URL...${NC}"
echo "$PROD_URL" | vercel env add NEXTAUTH_URL production

echo -e "${BLUE}Adding NEXTAUTH_SECRET...${NC}"
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

echo -e "${BLUE}Adding NEXT_PUBLIC_APP_NAME...${NC}"
echo "Canvas Credit Union" | vercel env add NEXT_PUBLIC_APP_NAME production

echo -e "${BLUE}Adding NEXT_PUBLIC_APP_URL...${NC}"
echo "$PROD_URL" | vercel env add NEXT_PUBLIC_APP_URL production

echo -e "${BLUE}Adding NEXT_PUBLIC_BANK_ROUTING...${NC}"
echo "302075830" | vercel env add NEXT_PUBLIC_BANK_ROUTING production

echo -e "${BLUE}Adding NEXT_PUBLIC_BANK_NAME...${NC}"
echo "Canvas Credit Union" | vercel env add NEXT_PUBLIC_BANK_NAME production

echo -e "${BLUE}Adding NEXT_PUBLIC_BANK_BRANCH...${NC}"
echo "Main Branch" | vercel env add NEXT_PUBLIC_BANK_BRANCH production

echo ""
echo -e "${GREEN}✅ All environment variables added!${NC}"
echo ""
echo "Now run: vercel --prod"
