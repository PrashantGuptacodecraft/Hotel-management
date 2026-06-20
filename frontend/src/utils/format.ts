// Formatting helpers shared across the platform.

export const formatCurrency = (n: number, currency = 'USD', compact = false): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(n)

export const formatNumber = (n: number, compact = false): string =>
  new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n)

export const formatPercent = (n: number): string => `${Math.round(n * 10) / 10}%`

export const initials = (name: string): string =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
