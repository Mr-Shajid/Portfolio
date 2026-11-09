import { apiRequest } from './client'

export async function listAdminProjects() {
  const body = await apiRequest('/api/admin/projects')
  return body.data
}

export async function getAdminProject(id) {
  const body = await apiRequest(`/api/admin/projects/${id}`)
  return body.data
}

export async function createAdminProject(data) {
  const body = await apiRequest('/api/admin/projects', { method: 'POST', body: data })
  return body.data
}

export async function updateAdminProject(id, changes) {
  const body = await apiRequest(`/api/admin/projects/${id}`, {
    method: 'PATCH',
    body: changes,
  })
  return body.data
}

export async function deleteAdminProject(id) {
  await apiRequest(`/api/admin/projects/${id}`, { method: 'DELETE' })
}