// Mirror of the backend add-on catalog (src/lib/catalog.ts). The customer
// sends KEYS only; the server re-prices, so these prices are display-only.
export interface Addon {
  key: string
  name: string
  price: number
}

export const ADDONS: Addon[] = [
  { key: 'airport-transfer', name: 'Airport Transfer', price: 75 },
  { key: 'spa-package', name: 'Spa Package', price: 220 },
  { key: 'breakfast', name: 'Breakfast Buffet', price: 45 },
  { key: 'late-checkout', name: 'Late Checkout', price: 60 },
  { key: 'champagne', name: 'Champagne & Fruit', price: 120 },
  { key: 'private-dining', name: 'Private Dining', price: 350 },
]

export const TAX_RATE = 0.12
