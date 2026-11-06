import 'dotenv/config'
import readline from 'node:readline/promises'
import { Writable } from 'node:stream'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Admin from '../models/Admin.js'

// Lets us hide what is typed when asking for the password
let muted = false
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding)
    callback()
  },
})

const rl = readline.createInterface({
  input: process.stdin,
  output,
  terminal: true,
})

async function run() {
  await connectDB()

  // Safety check: never overwrite or add a second admin
  const existing = await Admin.countDocuments()
  if (existing > 0) {
    console.log('An admin already exists. Nothing was changed.')
    return
  }

  const email = (await rl.question('Admin email: ')).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log('That does not look like a valid email. Nothing was created.')
    return
  }

  muted = true
  process.stdout.write('Password (min 12 characters, hidden): ')
  const password = await rl.question('')
  process.stdout.write('\nRepeat password: ')
  const repeat = await rl.question('')
  muted = false
  process.stdout.write('\n')

  if (password.length < 12) {
    console.log('Password must be at least 12 characters. Nothing was created.')
    return
  }
  if (password !== repeat) {
    console.log('Passwords did not match. Nothing was created.')
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await Admin.create({ email, passwordHash })
  console.log('Admin created. You can now log in with that email.')
}

run()
  .catch((error) => {
    console.error('Setup failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    rl.close()
    await mongoose.disconnect()
  })