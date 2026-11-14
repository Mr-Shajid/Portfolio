import { API_URL } from './config'

export async function getGithubRepos() {
  const response = await fetch(`${API_URL}/api/github/repos`)
  if (!response.ok) throw new Error('Failed to load repositories')

  const body = await response.json()
  return body.data
}