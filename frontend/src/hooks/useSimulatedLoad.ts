import { useEffect, useState } from 'react'

/** Simulates a network fetch so skeleton loaders are visible on first paint. */
export function useSimulatedLoad(delay = 700): boolean {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(t)
  }, [delay])
  return loading
}
