// SQLite has no array columns, so list fields are stored as JSON strings.
// These helpers (de)serialize them and shape DB rows for API responses.

export const toJson = (arr: unknown[]): string => JSON.stringify(arr ?? [])

export const fromJson = <T = string>(value: string | null | undefined): T[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

/** Strip sensitive fields and deserialize arrays for a Room row. */
export function serializeRoom<T extends { amenities: string; images: string }>(room: T) {
  return {
    ...room,
    amenities: fromJson(room.amenities),
    images: fromJson(room.images),
  }
}

/** Deserialize array fields for a Guest row. */
export function serializeGuest<T extends { tags: string }>(guest: T) {
  return { ...guest, tags: fromJson(guest.tags) }
}

/** Remove all auth/secret fields before returning a User to any client. */
export function publicUser<
  T extends {
    password?: string
    refreshToken?: string | null
    emailVerifyToken?: string | null
    emailVerifyExpiry?: Date | null
    resetToken?: string | null
    resetExpiry?: Date | null
  },
>(user: T) {
  const {
    password: _p,
    refreshToken: _r,
    emailVerifyToken: _ev,
    emailVerifyExpiry: _ee,
    resetToken: _rt,
    resetExpiry: _re,
    ...safe
  } = user
  return safe
}
