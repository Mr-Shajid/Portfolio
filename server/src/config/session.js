import session from 'express-session'
import MongoStore from 'connect-mongo'

const isProduction = process.env.NODE_ENV === 'production'

export function createSessionMiddleware() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is missing. Add it to server/.env')
  }

  const eightHours = 8 * 60 * 60

  return session({
    name: 'portfolio.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // no cookie for visitors who never log in
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: eightHours, // sessions expire after 8 hours
    }),
        cookie: {
      httpOnly: true, 
      secure: isProduction, // HTTPS only in production
      // The browser only talks to the frontend address (it forwards /api),
      // so the cookie is first-party and Lax is enough.
      sameSite: 'lax',
      maxAge: eightHours * 1000,
    },
  })
}