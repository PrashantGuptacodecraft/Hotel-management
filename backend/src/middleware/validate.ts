import type { Request, Response, NextFunction } from 'express'
import { type ZodSchema } from 'zod'

interface Schemas {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

/**
 * Validates and COERCES request parts against zod schemas.
 * Parsed (typed) values overwrite the originals so controllers get clean data.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) req.body = schemas.body.parse(req.body)
    if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query))
    if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params))
    next()
  }
}
