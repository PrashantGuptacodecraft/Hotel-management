import type { Request, Response, NextFunction } from 'express'

/**
 * Minimal cookie parser — populates req.cookies from the Cookie header.
 * Avoids an extra dependency (cookie-parser) for the single refresh cookie
 * this app reads.
 */
export function parseCookies(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.cookie
  const jar: Record<string, string> = {}
  if (header) {
    for (const part of header.split(';')) {
      const idx = part.indexOf('=')
      if (idx > -1) {
        const key = part.slice(0, idx).trim()
        const val = part.slice(idx + 1).trim()
        if (key) jar[key] = decodeURIComponent(val)
      }
    }
  }
  req.cookies = jar
  next()
}
