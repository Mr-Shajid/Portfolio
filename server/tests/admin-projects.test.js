import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import Project from '../src/models/Project.js'
import {
  startTestApp,
  stopTestApp,
  resetDatabase,
  seedAdmin,
  getToken,
  TEST_ADMIN,
} from './helpers.js'

let app
let admin // a logged-in browser session
let token // its CSRF token

before(async () => {
  app = await startTestApp()
  await resetDatabase()
  await seedAdmin()

  admin = request.agent(app)
  const loginToken = await getToken(admin)
  const login = await admin
    .post('/api/auth/login')
    .set('X-CSRF-Token', loginToken)
    .send(TEST_ADMIN)
  assert.equal(login.status, 200)

  token = await getToken(admin) // login replaced the session, so fetch a new token
})

after(stopTestApp)

// Each test starts with no projects (the admin account stays)
beforeEach(async () => {
  await Project.deleteMany({})
})

const validProject = { title: 'Test project', description: 'A project made by a test.' }

function create(body) {
  return admin.post('/api/admin/projects').set('X-CSRF-Token', token).send(body)
}

// ---------- Creating ----------

test('create: a valid project is saved as an unpublished draft', async () => {
  const res = await create(validProject)
  assert.equal(res.status, 201)
  assert.equal(res.body.data.title, 'Test project')
  assert.equal(res.body.data.published, false)
  assert.equal(res.body.data.featured, false)
  assert.ok(res.body.data.createdAt)
  assert.ok(res.body.data.updatedAt)
})

test('create: missing title or description is rejected', async () => {
  const noTitle = await create({ description: 'No title here' })
  assert.equal(noTitle.status, 400)

  const noDescription = await create({ title: 'No description' })
  assert.equal(noDescription.status, 400)
})

test('create: dangerous or invalid URLs are rejected in every URL field', async () => {
  const badUrls = [
    'javascript:alert(1)',
    'ftp://example.com/file',
    'data:text/html,hello',
    'not a url',
  ]
  for (const field of ['githubUrl', 'liveUrl', 'imageUrl']) {
    for (const bad of badUrls) {
      const res = await create({ ...validProject, [field]: bad })
      assert.equal(res.status, 400, `${field} should reject ${bad}`)
    }
  }
  const count = await Project.countDocuments()
  assert.equal(count, 0, 'nothing should have been saved')
})

test('create: https and http URLs are accepted', async () => {
  const res = await create({
    ...validProject,
    githubUrl: 'https://github.com/example/repo',
    liveUrl: 'http://example.com',
  })
  assert.equal(res.status, 201)
})

test('create: wrong data types are rejected', async () => {
  const bodies = [
    { ...validProject, title: 123 },
    { ...validProject, features: 'not a list' },
    { ...validProject, technologies: [1, 2, 3] },
    { ...validProject, published: 'yes' },
    { ...validProject, displayOrder: -1 },
    { ...validProject, displayOrder: 1.5 },
    { ...validProject, title: { $ne: '' } },
  ]
  for (const body of bodies) {
    const res = await create(body)
    assert.equal(res.status, 400, JSON.stringify(body))
  }
})

test('create: length limits are enforced', async () => {
  const tooLongTitle = await create({ ...validProject, title: 'x'.repeat(101) })
  assert.equal(tooLongTitle.status, 400)

  const tooManyFeatures = await create({
    ...validProject,
    features: Array.from({ length: 11 }, (_, i) => `feature ${i}`),
  })
  assert.equal(tooManyFeatures.status, 400)

  const tooManyTechnologies = await create({
    ...validProject,
    technologies: Array.from({ length: 16 }, (_, i) => `tech ${i}`),
  })
  assert.equal(tooManyTechnologies.status, 400)
})

test('create: unknown and protected fields are ignored, not saved', async () => {
  const res = await create({
    ...validProject,
    isAdmin: true,
    createdAt: '2000-01-01T00:00:00.000Z',
    _id: '000000000000000000000001',
  })
  assert.equal(res.status, 201)
  assert.equal(res.body.data.isAdmin, undefined)
  assert.notEqual(res.body.data._id, '000000000000000000000001')
  assert.ok(!res.body.data.createdAt.startsWith('2000'))
})

// ---------- CSRF and authentication ----------

test('changes without a CSRF token are rejected, even when logged in', async () => {
  const project = await Project.create(validProject)

  const post = await admin.post('/api/admin/projects').send(validProject)
  assert.equal(post.status, 403)

  const patch = await admin.patch(`/api/admin/projects/${project._id}`).send({ title: 'Hacked' })
  assert.equal(patch.status, 403)

  const del = await admin.delete(`/api/admin/projects/${project._id}`)
  assert.equal(del.status, 403)

  const unchanged = await Project.findById(project._id)
  assert.equal(unchanged.title, 'Test project')
})

test('anonymous visitors cannot read, create, change or delete projects', async () => {
  const project = await Project.create(validProject)
  const id = project._id.toString()

  const results = await Promise.all([
    request(app).get('/api/admin/projects'),
    request(app).get(`/api/admin/projects/${id}`),
    request(app).post('/api/admin/projects').send(validProject),
    request(app).patch(`/api/admin/projects/${id}`).send({ title: 'Hacked' }),
    request(app).delete(`/api/admin/projects/${id}`),
  ])
  for (const res of results) assert.equal(res.status, 401)

  const still = await Project.findById(id)
  assert.equal(still.title, 'Test project')
  assert.equal(await Project.countDocuments(), 1)
})

// ---------- Reading ----------

test('list: admins see drafts and published projects, in display order', async () => {
  await Project.create([
    { title: 'Later', description: 'b', published: true, displayOrder: 5 },
    { title: 'Draft first', description: 'a', published: false, displayOrder: 1 },
  ])
  const res = await admin.get('/api/admin/projects')
  assert.equal(res.status, 200)
  assert.deepEqual(res.body.data.map((p) => p.title), ['Draft first', 'Later'])
  assert.equal(res.body.data[0].published, false)
})

test('read one: found, not found, and invalid id', async () => {
  const project = await Project.create(validProject)

  const found = await admin.get(`/api/admin/projects/${project._id}`)
  assert.equal(found.status, 200)
  assert.equal(found.body.data.title, 'Test project')

  const missing = await admin.get('/api/admin/projects/000000000000000000000000')
  assert.equal(missing.status, 404)

  const invalid = await admin.get('/api/admin/projects/abc')
  assert.equal(invalid.status, 400)
})

// ---------- Updating ----------

test('update: publishing and unpublishing controls public visibility', async () => {
  const created = await create(validProject)
  const id = created.body.data._id

  let publicList = await request(app).get('/api/projects')
  assert.equal(publicList.body.data.length, 0, 'a draft is not public')

  const publish = await admin
    .patch(`/api/admin/projects/${id}`)
    .set('X-CSRF-Token', token)
    .send({ published: true })
  assert.equal(publish.status, 200)
  assert.equal(publish.body.data.published, true)

  publicList = await request(app).get('/api/projects')
  assert.equal(publicList.body.data.length, 1, 'a published project is public')

  await admin
    .patch(`/api/admin/projects/${id}`)
    .set('X-CSRF-Token', token)
    .send({ published: false })

  publicList = await request(app).get('/api/projects')
  assert.equal(publicList.body.data.length, 0, 'unpublished again means hidden again')
})

test('update: featured flag and display order can be changed', async () => {
  const project = await Project.create(validProject)
  const res = await admin
    .patch(`/api/admin/projects/${project._id}`)
    .set('X-CSRF-Token', token)
    .send({ featured: true, displayOrder: 7 })
  assert.equal(res.status, 200)
  assert.equal(res.body.data.featured, true)
  assert.equal(res.body.data.displayOrder, 7)
})

test('update: invalid values are rejected and the stored project is unchanged', async () => {
  const project = await Project.create({
    ...validProject,
    githubUrl: 'https://github.com/example/repo',
  })
  const patch = (body) =>
    admin.patch(`/api/admin/projects/${project._id}`).set('X-CSRF-Token', token).send(body)

  assert.equal((await patch({ githubUrl: 'javascript:alert(1)' })).status, 400)
  assert.equal((await patch({ title: '' })).status, 400)
  assert.equal((await patch({ title: 'x'.repeat(101) })).status, 400)

  const unchanged = await Project.findById(project._id)
  assert.equal(unchanged.title, 'Test project')
  assert.equal(unchanged.githubUrl, 'https://github.com/example/repo')
})

test('update: only unknown fields means nothing to update', async () => {
  const project = await Project.create(validProject)
  const res = await admin
    .patch(`/api/admin/projects/${project._id}`)
    .set('X-CSRF-Token', token)
    .send({ role: 'admin' })
  assert.equal(res.status, 400)
  assert.deepEqual(res.body, { message: 'No valid fields to update' })
})

test('update: unknown project returns 404', async () => {
  const res = await admin
    .patch('/api/admin/projects/000000000000000000000000')
    .set('X-CSRF-Token', token)
    .send({ title: 'Nope' })
  assert.equal(res.status, 404)
})

// ---------- Deleting ----------

test('delete: removes the project everywhere, and a second delete is a 404', async () => {
  const created = await create({ ...validProject, published: true })
  const id = created.body.data._id

  let publicList = await request(app).get('/api/projects')
  assert.equal(publicList.body.data.length, 1)

  const del = await admin.delete(`/api/admin/projects/${id}`).set('X-CSRF-Token', token)
  assert.equal(del.status, 200)

  publicList = await request(app).get('/api/projects')
  assert.equal(publicList.body.data.length, 0)

  const again = await admin.delete(`/api/admin/projects/${id}`).set('X-CSRF-Token', token)
  assert.equal(again.status, 404)
})