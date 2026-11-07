// Blocks anyone who is not logged in. This runs on the SERVER,
// so hiding buttons in React is never the only protection.
export function requireAdmin(req, res, next) {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  next()
}