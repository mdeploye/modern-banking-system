# Canvas Credit Union - Application Routes

## Complete Route Structure

### Public Routes
- **/** - Landing page with features and services
- **/login** - Login page for customers and admin (tabbed interface)
- **/register** - Customer registration (4-step form)

### Customer Routes (Protected - requires CUSTOMER role)
- **/customer/dashboard** - Customer dashboard with account overview
- **/customer/profile** - View and edit profile information
- **/customer/transfer** - Fund transfer page
- **/customer/transactions** - Transaction history
- **/customer/beneficiaries** - Manage beneficiaries

### Admin Routes (Protected - requires ADMIN role)
- **/admin/dashboard** - Admin dashboard with statistics
- **/admin/approvals** - Approve pending customer accounts
- **/admin/customers** - Search and view customer details
- **/admin/credit** - Credit customer accounts (cash deposits)
- **/admin/debit** - Debit customer accounts
- **/admin/restrictions** - Manage account restrictions

### API Routes

#### Authentication
- **POST /api/auth/[...nextauth]** - NextAuth endpoints (signin, signout, session)

#### Customer APIs
- **POST /api/customer/register** - Customer registration
- **GET /api/customer/account** - Get customer account details (protected)

#### Staff APIs
- **GET /api/staff/stats** - Get dashboard statistics (protected)

## Route Protection (Middleware)

The application uses Next.js middleware for route protection:

### Protected Routes
- All `/customer/*` routes require authenticated CUSTOMER
- All `/staff/*` routes require authenticated STAFF or ADMIN
- Unauthenticated users are redirected to `/login`

### Role-Based Access
- Customers cannot access staff routes
- Staff cannot access customer routes
- Logged-in users accessing `/login` or `/register` are redirected to their dashboard

## Authentication Flow

### Customer Registration
1. User completes 4-step registration form at `/register`
2. Account is created with `PENDING` status
3. User is redirected to `/login`
4. After staff approval, customer can access full features

### Login
1. User selects role (Customer or Staff) at `/login`
2. Credentials are validated via NextAuth
3. JWT token is issued with role information
4. User is redirected to appropriate dashboard

### Logout
- Available from all authenticated pages
- Clears session and redirects to home page

## Data Models

### User Roles
- **CUSTOMER** - Regular banking customers
- **STAFF** - Bank staff members
- **ADMIN** - System administrators

### Account Status
- **PENDING** - Awaiting staff approval
- **ACTIVE** - Approved and operational
- **SUSPENDED** - Temporarily disabled
- **CLOSED** - Permanently closed

### Account Types
- **SAVING** - Savings account
- **CURRENT** - Current account

## Future Routes (Coming Soon)

### Customer
- `/customer/cards` - Debit card management
- `/customer/statements` - Download account statements
- `/customer/settings` - Account settings

### Staff
- `/staff/transactions` - View all transactions
- `/staff/reports` - Generate reports
- `/staff/close-account` - Close customer accounts

### Admin (Future)
- `/admin/dashboard` - Admin dashboard
- `/admin/staff` - Manage staff members
- `/admin/settings` - System settings

## Navigation Patterns

### Customer Navigation
```
Landing Page → Login → Customer Dashboard
                ↓
Register → Pending Approval → Login → Dashboard
```

### Staff Navigation
```
Landing Page → Login (Staff Tab) → Staff Dashboard
```

## Security Features

1. **JWT-based Authentication** - Secure session management
2. **Password Hashing** - bcrypt with 12 rounds
3. **Role-based Access Control** - Middleware enforcement
4. **Protected API Routes** - Server-side session validation
5. **CSRF Protection** - Built into NextAuth
6. **Input Validation** - Zod schemas on all forms

## Testing Routes

### Quick Test Commands
```bash
# Home page
curl http://localhost:3000/

# Login page
curl http://localhost:3000/login

# Register page
curl http://localhost:3000/register

# Protected route (should redirect)
curl -L http://localhost:3000/customer/dashboard
```

### Test User Creation
After registration, a staff member must approve the account through:
1. Login as staff
2. Navigate to `/staff/approvals`
3. Approve pending accounts

## Error Handling

- **404** - Page not found (custom error page)
- **401** - Unauthorized (redirects to login)
- **403** - Forbidden (wrong role for route)
- **500** - Server error (with user-friendly message)

## Notes

- All customer routes show appropriate warnings for pending/suspended accounts
- Staff dashboard shows real-time statistics
- All forms include client-side and server-side validation
- Responsive design works on mobile, tablet, and desktop
