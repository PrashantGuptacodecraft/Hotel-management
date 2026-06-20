/** Operational error with an HTTP status code. Thrown anywhere; caught by errorHandler. */
export class ApiError extends Error {
  statusCode: number
  details?: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  static badRequest = (m = 'Bad request', d?: unknown) => new ApiError(400, m, d)
  static unauthorized = (m = 'Unauthorized') => new ApiError(401, m)
  static forbidden = (m = 'Forbidden') => new ApiError(403, m)
  static notFound = (m = 'Not found') => new ApiError(404, m)
  static conflict = (m = 'Conflict') => new ApiError(409, m)
  static tooMany = (m = 'Too many requests') => new ApiError(429, m)
}
