// Philippine Peso formatting utilities
export function formatPHP(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPHPCompact(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M"
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + "K"
  }
  return formatPHP(amount)
}

export function parsePHP(value: string): number {
  // Remove commas and parse as float
  return Number.parseFloat(value.replace(/,/g, "")) || 0
}

// Validate PHP amount input
export function isValidPHPAmount(value: string): boolean {
  const regex = /^\d{1,3}(,\d{3})*(\.\d{2})?$|^\d+(\.\d{2})?$/
  return regex.test(value)
}
