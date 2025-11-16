/**
 * Format currency with comma separators
 * Example: 1234.56 => $1,234.56
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format currency without symbol (for inputs)
 * Example: 1234.56 => 1,234.56
 */
export function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format account number with US standard format (spaces every 4 digits)
 * Example: 1234567890 => 1234 5678 90
 */
export function formatAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * Format routing number (9 digits with spaces)
 * Example: 021000021 => 021 000 021
 */
export function formatRoutingNumber(routingNumber: string): string {
  return routingNumber.replace(/(\d{3})(?=\d)/g, '$1 ')
}
