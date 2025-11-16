# 🎰 Luxury Transaction Generator

Generate realistic high-class transaction histories for customers with luxury lifestyle spending patterns.

## 🎯 Features

### Income Sources:
- 💹 Stock trading profits (Tesla, NVIDIA, Apple)
- ₿ Cryptocurrency gains (Bitcoin, Ethereum)
- 🏢 Real estate rental income
- 💼 Private equity & hedge fund returns
- 🚀 Venture capital exits
- 🎨 Art & collectible sales
- 💰 Investment dividends

### Luxury Expenses:
- ✈️ **First Class Travel**: Emirates, Singapore Airlines, Private Jets
- 🛥️ **Yacht**: Mediterranean charters, maintenance, crew
- 🎰 **Casinos**: Monte Carlo, Las Vegas, Macau, Singapore
- 🏎️ **Exotic Cars**: Ferrari, Lamborghini, Bugatti, McLaren
- ⌚ **Luxury Watches**: Rolex, Patek Philippe, Richard Mille
- 👜 **Designer Fashion**: Hermès, Louis Vuitton, Tom Ford
- 🍽️ **Fine Dining**: Michelin-starred restaurants, exclusive bars
- 🎉 **VIP Nightlife**: 1 OAK, LIV, Omnia, Hakkasan
- 🏠 **Real Estate**: Manhattan penthouses, Miami villas
- 🎨 **Art & Collectibles**: Christie's, Sotheby's auctions
- ₿ **Crypto Trading**: Bitcoin, NFTs, digital assets

## 📊 Transaction Volume

- **Time Period**: January 2023 to Present
- **Monthly Income**: 2-5 transactions
- **Monthly Expenses**: 8-15 transactions
- **Total Transactions**: ~500-800 (depending on date range)

## 🚀 Usage

### Method 1: Using ts-node (Recommended)

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run for a specific customer
npx ts-node scripts/generate-luxury-transactions.ts <customerNumber> [targetBalance]

# Example: Generate for customer CUS001 with 8.6M balance
npx ts-node scripts/generate-luxury-transactions.ts CUS001 8600000

# Example: Generate with default 8.6M balance
npx ts-node scripts/generate-luxury-transactions.ts CUS001
```

### Method 2: Using npm script

Add to your `package.json`:

```json
{
  "scripts": {
    "generate-luxury": "ts-node scripts/generate-luxury-transactions.ts"
  }
}
```

Then run:
```bash
npm run generate-luxury CUS001 8600000
```

### Method 3: Compile and run

```bash
# Compile TypeScript
npx tsc scripts/generate-luxury-transactions.ts

# Run compiled JavaScript
node scripts/generate-luxury-transactions.js CUS001 8600000
```

## 📝 Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| customerNumber | Yes | - | Customer number (e.g., CUS001) |
| targetBalance | No | 8,600,000 | Final account balance in dollars |

## 📖 Examples

### Example 1: Standard Luxury Customer (8.6M)
```bash
npx ts-node scripts/generate-luxury-transactions.ts CUS001
```

### Example 2: Ultra High Net Worth (50M)
```bash
npx ts-node scripts/generate-luxury-transactions.ts CUS002 50000000
```

### Example 3: Moderate Wealth (2M)
```bash
npx ts-node scripts/generate-luxury-transactions.ts CUS003 2000000
```

## 🎨 Sample Transaction Types

### Income (Credits)
- Stock Trading Profit - Tesla: $50,000 - $250,000
- Cryptocurrency Gain - Bitcoin: $80,000 - $400,000
- Venture Capital Exit: $500,000 - $2,000,000
- Real Estate Rental Income: $25,000 - $60,000

### Expenses (Debits)
- Private Jet Charter - NetJets: $45,000 - $120,000
- Yacht Charter - Mediterranean: $150,000 - $350,000
- Casino Royale - Monte Carlo: $50,000 - $250,000
- Ferrari F8 Tributo: $280,000 - $350,000
- Patek Philippe Watch: $200,000 - $500,000

## ⚠️ Important Notes

1. **Backup First**: This script **deletes existing transactions** for the account
2. **One Account**: Uses the customer's first account (typically checking)
3. **Balance Calculation**: Automatically adjusts transactions to reach target balance
4. **Date Range**: Generates from Jan 1, 2023 to current date
5. **Random Amounts**: Amounts vary within realistic ranges for each category

## 🔍 What the Script Does

1. ✅ Finds customer by customer number
2. ✅ Gets customer's first account
3. ✅ Deletes existing transactions (backup first!)
4. ✅ Generates random luxury transactions (2023 - now)
5. ✅ Calculates running balance
6. ✅ Adjusts to hit target balance exactly
7. ✅ Sorts by date chronologically
8. ✅ Inserts in batches for performance
9. ✅ Updates account balance

## 📊 Output Example

```
🎰 Generating luxury transaction history for customer: CUS001
🎯 Target final balance: $8,600,000
💳 Using account: ACC001234567
💰 Current balance: $5,000
⚖️  Balance adjustment needed: $8,595,000
🗑️  Deleting existing transactions...
💾 Inserting transactions...
   Inserted batch 1/7
   Inserted batch 2/7
   ...
📊 Generated 650 transactions
💵 Final calculated balance: $8,600,000
✅ Transaction history generated successfully!
📈 Total Credits: $45,320,500
📉 Total Debits: $36,720,500
💰 Final Balance: $8,600,000
🎉 Done!
```

## 🎯 Use Cases

1. **Demo Accounts**: Create impressive demo data for presentations
2. **Testing**: Test dashboard with realistic high-value transactions
3. **Customer Onboarding**: Quickly populate accounts for VIP clients
4. **Development**: Test transaction filtering, sorting, analytics
5. **Performance Testing**: Load test with large transaction volumes

## 🔐 Security Notes

- Only use in development/staging environments
- Never run on production without proper backup
- Customer must exist in database
- Customer must have at least one account
- Requires database write permissions

## 🛠️ Troubleshooting

### Error: Customer not found
```bash
# Check customer number is correct
# List all customers:
npx prisma studio
# Or query database
```

### Error: Customer has no accounts
```bash
# Create an account for the customer first
# Or use a different customer
```

### Error: Cannot find module 'ts-node'
```bash
# Install ts-node
npm install -D ts-node
```

## 📚 Related Scripts

- `seed.ts` - Initial database seeding
- `reset-db.ts` - Reset database (if you create it)
- `backup-transactions.ts` - Backup before running (if you create it)

---

**Created by**: Canvas Banking System
**Version**: 1.0.0
**License**: MIT
