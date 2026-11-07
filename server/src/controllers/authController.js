import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'

// A real hash of a throwaway string. If the email doesn't exist we still
// compare against this, so the response time doesn't reveal which emails exist.
const dummyHash = bcrypt.hashSync('not-a-real-password', 12)

export async function login(req, res, next) {
  try {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''

    if (!email || !password || password.length > 200) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const admin = await Admin.findOne({ email }).select('+passwordHash')
    const passwordMatches = await bcrypt.compare(
      password,
      admin ? admin.passwordHash : dummyHash
    )

    // Same message for "no such email" and "wrong password" on purpose
    if (!admin || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Start a brand-new session on login (prevents session fixation attacks)
    req.session.regenerate((error) => {
      if (error) return next(error)
      req.session.adminId = admin._id.toString()
      req.session.save((saveError) => {
        if (saveError) return next(saveError)
        res.json({ email: admin.email })
      })
    })
  } catch (error) {
    next(error)
  }
}

export function logout(req, res, next) {
  // Destroys the session on the server, so the old cookie stops working
  req.session.destroy((error) => {
    if (error) return next(error)
    res.clearCookie('portfolio.sid')
    res.json({ message: 'Logged out' })
  })
}

export async function me(req, res, next) {
  try {
    const admin = await Admin.findById(req.session.adminId)
    if (!admin) return res.status(401).json({ message: 'Authentication required' })
    res.json({ email: admin.email })
  } catch (error) {
    next(error)
  }
}