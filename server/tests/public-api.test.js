import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import Project from '../src/models/Project.js'
import { startTestApp, stopTestApp, resetDatabase } from './helpers.js'

let app

before(async () => {
  app = await startTestApp()
})

after(async () => {
  await stopTestApp()
})

beforeEach(async () => {
  await resetDatabase()
})

test('health endpoint reports app and database status', async () => {
  const res = await request(app).get('/api/health')
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, { status: 'ok', database: 'connected' })
})

test('public projects: empty database returns an empty list', async () => {
  const res = await request(app).get('/api/projects')
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, { data: [] })
})

test('public projects: only published projects are returned, in display order', async () => {
  await Project.create([
    { title: 'Second', description: 'b', published: true, displayOrder: 2 },
    { title: 'Hidden draft', description: 'c', published: false, displayOrder: 0 },
    { title: 'First', description: 'a', published: true, displayOrder: 1 },
  ])

  const res = await request(app).get('/api/projects')
  assert.equal(res.status, 200)
  assert.deepEqual(res.body.data.map((p) => p.title), ['First', 'Second'])
})

test('public projects: internal fields are not exposed', async () => {
  await Project.create({ title: 'Visible', description: 'x', published: true })

  const res = await request(app).get('/api/projects')
  const project = res.body.data[0]
  assert.equal(project.published, undefined)
  assert.equal(project.__v, undefined)
  assert.equal(project.title, 'Visible')
})

test('unknown routes return a plain 404 with no stack trace', async () => {
  const res = await request(app).get('/api/does-not-exist')
  assert.equal(res.status, 404)
  assert.deepEqual(res.body, { message: 'Not found' })
})

test('invalid JSON is rejected with 400', async () => {
  const res = await request(app)
    .post('/api/contact')
    .set('Content-Type', 'application/json')
    .send('{bad json')
  assert.equal(res.status, 400)
  assert.deepEqual(res.body, { message: 'Invalid JSON in request body' })
})

test('oversized request bodies are rejected with 413', async () => {
  const res = await request(app)
    .post('/api/contact')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ message: 'x'.repeat(11000) }))
  assert.equal(res.status, 413)
})

test('security headers are set and the framework is not advertised', async () => {
  const res = await request(app).get('/api/health')
  assert.equal(res.headers['x-content-type-options'], 'nosniff')
  assert.equal(res.headers['x-powered-by'], undefined)
})

test('CORS only allows the configured frontend origin', async () => {
  const res = await request(app)
    .get('/api/projects')
    .set('Origin', 'https://evil.example')

  const allowed = res.headers['access-control-allow-origin']
  assert.equal(allowed, 'http://localhost:5173')
  assert.notEqual(allowed, '*')
  assert.notEqual(allowed, 'https://evil.example')
  assert.equal(res.headers['access-control-allow-credentials'], 'true')
})