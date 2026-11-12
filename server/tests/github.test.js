import { test, before, after, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { startTestApp, stopTestApp } from './helpers.js'

let app
let firstResult // the data returned by the first successful call

// What GitHub would return, including things we must filter out or hide
const fakeGithubRepos = [
  {
    id: 1,
    name: 'good-repo',
    description: 'A normal repository',
    language: 'JavaScript',
    stargazers_count: 3,
    html_url: 'https://github.com/test-user/good-repo',
    pushed_at: '2026-01-02T00:00:00Z',
    fork: false,
    archived: false,
    owner: { login: 'test-user', email: 'private@test.example' },
  },
  {
    id: 2,
    name: 'a-fork',
    description: 'Should be filtered out',
    fork: true,
    archived: false,
    html_url: 'https://github.com/test-user/a-fork',
  },
  {
    id: 3,
    name: 'old-and-archived',
    description: 'Should be filtered out',
    fork: false,
    archived: true,
    html_url: 'https://github.com/test-user/old-and-archived',
  },
  {
    id: 4,
    name: 'no-description-repo',
    description: null,
    language: null,
    stargazers_count: 0,
    html_url: 'https://github.com/test-user/no-description-repo',
    pushed_at: '2026-01-01T00:00:00Z',
    fork: false,
    archived: false,
  },
]

before(async () => {
  app = await startTestApp()
})

after(stopTestApp)

afterEach(() => {
  mock.restoreAll()
  mock.timers.reset()
})

test('no username configured gives 503', async () => {
  process.env.GITHUB_USERNAME = ''
  const res = await request(app).get('/api/github/repos')
  assert.equal(res.status, 503)
})

test('an invalid username format is refused before calling GitHub', async () => {
  process.env.GITHUB_USERNAME = 'bad name/../x'
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    throw new Error('GitHub must not be called')
  })
  const res = await request(app).get('/api/github/repos')
  assert.equal(res.status, 503)
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('repos are fetched, filtered and reduced to safe fields', async () => {
  process.env.GITHUB_USERNAME = 'test-user'
  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => fakeGithubRepos,
  }))

  const res = await request(app).get('/api/github/repos')
  assert.equal(res.status, 200)
  assert.equal(res.body.cached, false)
  assert.deepEqual(res.body.data.map((r) => r.name), ['good-repo', 'no-description-repo'])

  // Only the fields visitors need. Owner details are not passed on.
  assert.deepEqual(Object.keys(res.body.data[0]).sort(), [
    'description', 'id', 'language', 'name', 'stars', 'updatedAt', 'url',
  ])
  assert.ok(!JSON.stringify(res.body).includes('private@test.example'))

  // Missing values become empty text, not null
  assert.equal(res.body.data[1].description, '')
  assert.equal(res.body.data[1].language, '')

  // The request to GitHub used the right address and a User-Agent
  assert.equal(fetchMock.mock.callCount(), 1)
  const [url, options] = fetchMock.mock.calls[0].arguments
  assert.ok(url.startsWith('https://api.github.com/users/test-user/repos'))
  assert.ok(options.headers['User-Agent'])
  assert.equal(options.headers.Authorization, undefined, 'no token is sent')

  firstResult = res.body.data
})

test('a second request within 10 minutes is served from the cache', async () => {
  process.env.GITHUB_USERNAME = 'test-user'
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    throw new Error('GitHub must not be called on a cache hit')
  })

  const res = await request(app).get('/api/github/repos')
  assert.equal(res.status, 200)
  assert.equal(res.body.cached, true)
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('when GitHub fails after the cache expires, the old copy is served as stale', async () => {
  process.env.GITHUB_USERNAME = 'test-user'

  // Move the clock forward 11 minutes (past the 10 minute cache)
  mock.timers.enable({ apis: ['Date'], now: Date.now() })
  mock.timers.tick(11 * 60 * 1000)

  // GitHub now says "rate limit exceeded"
  mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 403 }))

  const res = await request(app).get('/api/github/repos')
  assert.equal(res.status, 200)
  assert.equal(res.body.stale, true)
  assert.deepEqual(res.body.data, firstResult)
})

test('when GitHub fails and there is no cached copy, the answer is a clean 503', async () => {
  process.env.GITHUB_USERNAME = 'someone-else' // nothing cached for this name
  mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 404 }))

  const res = await request(app).get('/api/github/repos')
  assert.equal(res.status, 503)
  assert.deepEqual(res.body, { message: 'GitHub repositories are unavailable right now' })
})