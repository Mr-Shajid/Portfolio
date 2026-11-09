const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function getGithubRepos() {
  const response = await fetch(`${API_URL}/api/github/repos`)
  if (!response.ok) throw new Error('Failed to load repositories')

  const body = await response.json()
  return body.data
}