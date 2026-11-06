const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function getProjects() {
  const response = await fetch(`${API_URL}/api/projects`)

  if (!response.ok) {
    throw new Error('Failed to load projects')
  }

  const body = await response.json()
  return body.data
}