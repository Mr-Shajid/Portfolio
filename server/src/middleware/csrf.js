import { csrfSync } from 'csrf-sync'

// Protects every method except GET, HEAD and OPTIONS.
// The client must send the token in the X-CSRF-Token header.
export const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
})