// In-memory access token holder. Kept out of the store to avoid a circular
// import between the axios client and the Zustand store.
let accessToken: string | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string | null) => {
  accessToken = token
}
