import { apiRequest } from './client'

export async function listAdminProjects() {
  const body = await apiRequest('/api/admin/projects')
  return body.data
}

export async function updateAdminProject(id, changes) {
  const body = await apiRequest(`/api/admin/projects/${id}`, {
    method: 'PATCH',
    body: changes,
  })
  return body.data
}