import { test, before, after, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { startTestApp, stopTestApp } from './helpers.js'

// Must be set BEFORE the app loads. The real default of 5 per hour
// is checked separately in contact-rate-limit.test.js
process.env.CONTACT_RATE_LIMIT_PER_HOUR = '100'

let app
let fetchMock

const validMessage = {
  name: 'Test Visitor',
  email: 'visitor@test.example',
  subject: 'Hello',
  message: 'This is a test message from the automated tests.',
  website: '',
}

before(async () => {
  app = await startTestApp()
})

after(stopTestApp)

beforeEach(() => {
  process.env.RESEND_API_KEY = 're_test_key_not_real'
  process.env.CONTACT_TO_EMAIL = 'owner@test.example'
  process.env.CONTACT_FROM_EMAIL = 'Test <onboarding@resend.dev>'

  // Fake email provider: records the request and says "success"
  fetchMock = mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200 }))
})

afterEach(() => {
  mock.restoreAll()
})

function send(body) {
  return request(app).post('/api/contact').send(body)
}

test('a valid message is sent to the owner with the visitor as reply-to', async () => {
  const res = await send(validMessage)
  assert.equal(res.status, 200)
  assert.equal(fetchMock.mock.callCount(), 1)

  const [url, options] = fetchMock.mock.calls[0].arguments
  assert.equal(url, 'https://api.resend.com/emails')
  assert.equal(options.method, 'POST')
  assert.equal(options.headers.Authorization, 'Bearer re_test_key_not_real')

  const sent = JSON.parse(options.body)
  assert.deepEqual(sent.to, ['owner@test.example'])
  assert.equal(sent.reply_to, 'visitor@test.example')
  assert.ok(sent.subject.includes('Hello'))
  assert.ok(sent.text.includes(validMessage.message))
})

test('messages are sent as plain text, never HTML', async () => {
  const res = await send({ ...validMessage, message: '<script>alert(1)</script> hello there' })
  assert.equal(res.status, 200)

  const sent = JSON.parse(fetchMock.mock.calls[0].arguments[1].body)
  assert.equal(sent.html, undefined)
  assert.ok(sent.text.includes('<script>alert(1)</script>'))
})

test('line breaks cannot be used to inject email headers', async () => {
  const res = await send({
    ...validMessage,
    name: 'Bob\r\nBcc: evil@test.example',
    subject: 'Hello\r\nBcc: evil@test.example',
  })
  assert.equal(res.status, 200)

  const sent = JSON.parse(fetchMock.mock.calls[0].arguments[1].body)
  assert.ok(!/[\r\n]/.test(sent.subject), 'subject has no line breaks')

  const lines = sent.text.split('\n')
  assert.ok(lines[0].startsWith('Name: '))
  assert.equal(lines[1], 'Email: visitor@test.example')
  assert.ok(lines[2].startsWith('Subject: '))
})

test('the hidden spam-trap field gets a fake success and sends nothing', async () => {
  const res = await send({ ...validMessage, website: 'http://spam.example' })
  assert.equal(res.status, 200)
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('invalid input is rejected with 400 and nothing is sent', async () => {
  const badBodies = [
    {},
    { ...validMessage, name: 'A' },
    { ...validMessage, email: 'not-an-email' },
    { ...validMessage, message: 'short' },
    { ...validMessage, message: 'x'.repeat(2001) },
    { ...validMessage, subject: 'x'.repeat(121) },
    { ...validMessage, name: ['a', 'b'] },
    { ...validMessage, message: { text: 'object, not text' } },
    { ...validMessage, email: 123 },
  ]
  for (const body of badBodies) {
    const res = await send(body)
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80))
  }
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('without email configuration the form fails honestly with 503', async () => {
  process.env.RESEND_API_KEY = ''
  const res = await send(validMessage)
  assert.equal(res.status, 503)
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('if the email provider fails, visitors get a safe 502 with no secrets', async () => {
  fetchMock.mock.mockImplementation(async () => ({ ok: false, status: 500 }))
  const rejected = await send(validMessage)
  assert.equal(rejected.status, 502)
  assert.ok(!JSON.stringify(rejected.body).includes('re_test_key'))

  fetchMock.mock.mockImplementation(async () => {
    throw new Error('network down')
  })
  const crashed = await send(validMessage)
  assert.equal(crashed.status, 502)
  assert.ok(!JSON.stringify(crashed.body).includes('network down'))
})