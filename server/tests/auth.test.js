import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import {
  startTestApp,
  stopTestApp,
  resetDatabase,
  seedAdmin,
  getToken,
  TEST_ADMIN,
} from './helpers.js'

let app

before(async () => {
  app = await startTestApp()
  await resetDatabase()
  await seedAdmin()
})

after(async () => {
  await stopTestApp()
})

async function postLogin(agent, token, body) {
  return agent.post('/api/auth/login').set('X-CSRF-Token', token).send(body)
}

test('protected endpoints reject anonymous visitors with 401', async () => {
  const projects = await request(app).get('/api/admin/projects')
  assert.equal(projects.status, 401)

  const me = await request(app).get('/api/auth/me')
  assert.equal(me.status, 401)
})

test('login without a CSRF token is rejected with 403', async () => {
  const res = await request(app).post('/api/auth/login').send(TEST_ADMIN)
  assert.equal(res.status, 403)
})

test('wrong password and unknown email give the same generic 401', async () => {
  const agent = request.agent(app)
  const token = await getToken(agent)

  const wrongPassword = await postLogin(agent, token, {
    email: TEST_ADMIN.email,
    password: 'definitely-wrong-password',
  })
  const unknownEmail = await postLogin(agent, token, {
    email: 'nobody@test.example',
    password: 'definitely-wrong-password',
  })

  assert.equal(wrongPassword.status, 401)
  assert.equal(unknownEmail.status, 401)
  assert.deepEqual(wrongPassword.body, unknownEmail.body)
})

test('missing fields are rejected with 400', async () => {
  const agent = request.agent(app)
  const token = await getToken(agent)
  const res = await postLogin(agent, token, { email: TEST_ADMIN.email })
  assert.equal(res.status, 400)
})

test('database operators in the login body are not accepted', async () => {
  const agent = request.agent(app)
  const token = await getToken(agent)
  const res = await postLogin(agent, token, {
    email: { $ne: '' },
    password: { $ne: '' },
  })
  assert.equal(res.status, 400)
})

test('login, session and logout work end to end', async () => {
  const agent = request.agent(app)
  const token = await getToken(agent)

  // Login succeeds and never exposes the password hash
  const login = await postLogin(agent, token, TEST_ADMIN)
  assert.equal(login.status, 200)
  assert.equal(login.body.email, TEST_ADMIN.email)
  const loginText = JSON.stringify(login.body)
  assert.ok(!loginText.includes('passwordHash'))
  assert.ok(!loginText.includes('$2'))

  // The session cookie is HttpOnly
  const cookies = login.headers['set-cookie'] || []
  const sessionCookie = cookies.find((c) => c.startsWith('portfolio.sid='))
  assert.ok(sessionCookie, 'session cookie was set')
  assert.match(sessionCookie, /HttpOnly/i)
  assert.match(sessionCookie, /SameSite=Lax/i)

  // The session now grants access
  const me = await agent.get('/api/auth/me')
  assert.equal(me.status, 200)
  assert.equal(me.body.email, TEST_ADMIN.email)

  const projects = await agent.get('/api/admin/projects')
  assert.equal(projects.status, 200)

  // Logout (login created a new session, so fetch a fresh token first)
  const freshToken = await getToken(agent)
  const logout = await agent.post('/api/auth/logout').set('X-CSRF-Token', freshToken)
  assert.equal(logout.status, 200)

  const afterLogout = await agent.get('/api/auth/me')
  assert.equal(afterLogout.status, 401)

  // The OLD cookie must be dead on the server too, not just deleted in the browser
  const oldCookie = sessionCookie.split(';')[0]
  const replay = await request(app).get('/api/auth/me').set('Cookie', oldCookie)
  assert.equal(replay.status, 401)
})

test('there is no public registration route', async () => {
  const agent = request.agent(app)
  const token = await getToken(agent)
  const res = await agent
    .post('/api/auth/register')
    .set('X-CSRF-Token', token)
    .send({ email: 'new@test.example', password: 'another-long-password-1' })
  assert.equal(res.status, 404)
})

// Keep this test LAST: it uses up the login attempts for this test run
test('login is rate limited after repeated failures', async () => {
  const agent = request.agent(app)
  const token = await getToken(agent)

  let blockedAt = 0
  for (let attempt = 1; attempt <= 10; attempt++) {
    const res = await postLogin(agent, token, {
      email: TEST_ADMIN.email,
      password: 'wrong-password-again',
    })
    if (res.status === 429) {
      blockedAt = attempt
      break
    }
  }
  assert.ok(blockedAt > 0 && blockedAt <= 6, 'rate limit triggered')

  // While blocked, even the correct password is refused
  const correct = await postLogin(agent, token, TEST_ADMIN)
  assert.equal(correct.status, 429)
})