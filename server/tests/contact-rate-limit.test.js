import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { startTestApp, stopTestApp } from './helpers.js'

let app

before(async () => {
  app = await startTestApp() // default limit: 5 per hour
})

after(stopTestApp)

test('the contact form allows 5 requests per hour, then returns 429', async () => {
  // The spam-trap field makes the server answer 200 and send nothing,
  // so this test needs no email setup.
  const body = { website: 'a-bot-filled-this-in' }

  for (let i = 1; i <= 5; i++) {
    const res = await request(app).post('/api/contact').send(body)
    assert.equal(res.status, 200, `request ${i} should be allowed`)
  }

  const blocked = await request(app).post('/api/contact').send(body)
  assert.equal(blocked.status, 429)
  assert.deepEqual(blocked.body, { message: 'Too many messages sent. Please try again later.' })
})