# 🛠️ Development Guide

## Getting Started

### Local Development Setup

#### 1. Prerequisites
```bash
node --version  # v18+
npm --version   # v9+
git --version
```

#### 2. Clone and Install
```bash
git clone <repository-url>
cd modern-banking-system
npm install
```

#### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env with your values
```

#### 4. Database Setup

##### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb banking_db

# Update .env
DATABASE_URL="postgresql://localhost:5432/banking_db?schema=public"
```

##### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name banking-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=banking_db \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://localhost:5432/banking_db?schema=public&user=postgres&password=password"
```

#### 5. Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Run migrations
npx prisma migrate dev --name init
```

#### 6. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Project Structure

```
modern-banking-system/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   └── auth/         # NextAuth endpoints
│   │   ├── customer/         # Customer pages
│   │   ├── staff/            # Staff pages
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── utils.ts          # Helper functions
│   │   └── validations.ts    # Zod schemas
│   ├── hooks/                # Custom React hooks
│   │   └── use-toast.ts      # Toast notifications
│   └── middleware.ts         # Route protection
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Test locally
npm run dev

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature
```

### 2. Database Changes
```bash
# Modify prisma/schema.prisma
# Then:

# Development (creates migration)
npx prisma migrate dev --name add_new_field

# Or push directly (no migration file)
npx prisma db push

# Generate client
npx prisma generate
```

### 3. Adding UI Components
```bash
# Example: Adding a new shadcn/ui component
# Manually create in src/components/ui/

# Or use shadcn CLI (if available)
npx shadcn-ui@latest add button
```

## Code Standards

### TypeScript
- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type
- Use Zod for runtime validation

### React Components
```typescript
// Preferred pattern
import { FC } from 'react'

interface Props {
  title: string
  onClick: () => void
}

export const MyComponent: FC<Props> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  )
}
```

### API Routes
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    
    // Process data
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

### Database Queries
```typescript
// Use Prisma for type-safe queries
import prisma from '@/lib/prisma'

// Good ✅
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { customer: true }
})

// Avoid raw SQL unless necessary
```

## Testing

### Manual Testing
```bash
# Start dev server
npm run dev

# In another terminal, open Prisma Studio
npx prisma studio
```

### Test Checklist
- [ ] Registration flow
- [ ] Login/logout
- [ ] Profile viewing
- [ ] Fund transfer
- [ ] Transaction history
- [ ] Staff operations
- [ ] Error handling
- [ ] Mobile responsiveness

## Common Tasks

### Add New Database Table
1. Edit `prisma/schema.prisma`
2. Add model:
```prisma
model NewTable {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  
  @@map("new_tables")
}
```
3. Create migration:
```bash
npx prisma migrate dev --name add_new_table
```

### Add New API Route
1. Create file: `src/app/api/yourroute/route.ts`
2. Implement handler:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Hello' })
}
```

### Add New Page
1. Create file: `src/app/yourpage/page.tsx`
2. Implement component:
```typescript
export default function YourPage() {
  return <div>Your Page</div>
}
```

### Add Authentication to API Route
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Proceed with authenticated request
}
```

## Debugging

### Enable Debug Logging
```env
# .env
DEBUG=*
NEXTAUTH_DEBUG=true
```

### Prisma Studio
```bash
# Visual database browser
npx prisma studio
```

### Next.js DevTools
- React DevTools (browser extension)
- Network tab for API calls
- Console for logs

### Common Issues

#### Database Connection Error
```bash
# Reset database
npx prisma migrate reset

# Or push schema again
npx prisma db push
```

#### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### TypeScript Errors
```bash
# Regenerate Prisma client
npx prisma generate
```

## Performance Tips

1. **Use Server Components** by default
2. **Client Components** only when needed (interactivity)
3. **Optimize images** with Next.js Image
4. **Use dynamic imports** for heavy components
5. **Implement pagination** for large lists
6. **Add database indexes** for frequent queries

## Security During Development

- Never commit `.env` file
- Use different secrets for dev/prod
- Test with various user roles
- Validate all inputs
- Test error scenarios
- Check for SQL injection attempts
- Test authentication boundaries

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Create migration
npm run db:studio       # Open Prisma Studio

# Deployment
vercel                  # Deploy to Vercel
vercel --prod          # Deploy to production
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Getting Help

- Check documentation first
- Search existing GitHub issues
- Ask in discussions
- Join Discord/Slack (if available)

---

Happy coding! 🚀
