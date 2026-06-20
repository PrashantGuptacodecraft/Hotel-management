// Server-side source of truth for add-on pricing. Customers send add-on
// *keys* only; the server resolves the price so it can't be tampered with.

export interface AddonDef {
  key: string
  name: string
  price: number
}

export const ADDON_CATALOG: AddonDef[] = [
  { key: 'airport-transfer', name: 'Airport Transfer', price: 75 },
  { key: 'spa-package', name: 'Spa Package', price: 220 },
  { key: 'breakfast', name: 'Breakfast Buffet', price: 45 },
  { key: 'late-checkout', name: 'Late Checkout', price: 60 },
  { key: 'champagne', name: 'Champagne & Fruit', price: 120 },
  { key: 'private-dining', name: 'Private Dining', price: 350 },
]

const byKey = new Map(ADDON_CATALOG.map((a) => [a.key, a]))

export function resolveAddons(
  items: { key: string; quantity: number }[]
): { name: string; price: number; quantity: number }[] {
  return items
    .map((i) => {
      const def = byKey.get(i.key)
      if (!def) return null
      return { name: def.name, price: def.price, quantity: Math.max(1, Math.min(10, i.quantity)) }
    })
    .filter((x): x is { name: string; price: number; quantity: number } => x !== null)
}
