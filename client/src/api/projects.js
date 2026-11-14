import { API_URL } from './config'

export async function getProjects() {
  const response = await fetch(`${API_URL}/api/projects`)


  if (!response.ok) {
    throw new Error('Failed to load projects')
  }

  const body = await response.json()
  return body.data
}