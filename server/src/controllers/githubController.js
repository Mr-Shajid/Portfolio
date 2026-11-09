const CACHE_MS = 10 * 60 * 1000 // 10 minutes

// Kept in memory. It resets whenever the server restarts.
let cache = { username: '', data: null, fetchedAt: 0 }

async function fetchRepos(username) {
  // Give up after 8 seconds instead of making visitors wait
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const url =
      `https://api.github.com/users/${encodeURIComponent(username)}/repos` +
      '?type=owner&sort=updated&per_page=30'

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-site', // GitHub requires a User-Agent
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`GitHub responded with status ${response.status}`)
    }

    const repos = await response.json()

    // Keep only your own, active repos, and only the fields visitors need
    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .slice(0, 12)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || '',
        language: repo.language || '',
        stars: repo.stargazers_count,
        url: repo.html_url,
        updatedAt: repo.pushed_at || repo.updated_at,
      }))
  } finally {
    clearTimeout(timer)
  }
}

// GET /api/github/repos
export async function getGithubRepos(req, res) {
  const username = process.env.GITHUB_USERNAME

  // GitHub usernames: letters, numbers and hyphens, up to 39 characters
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return res.status(503).json({ message: 'GitHub integration is not configured' })
  }

  const cacheIsFresh =
    cache.data && cache.username === username && Date.now() - cache.fetchedAt < CACHE_MS

  if (cacheIsFresh) {
    return res.json({ data: cache.data, cached: true })
  }

  try {
    const data = await fetchRepos(username)
    cache = { username, data, fetchedAt: Date.now() }
    res.json({ data, cached: false })
  } catch (error) {
    // Log the reason, never anything sensitive
    console.error('GitHub fetch failed:', error.message)

    // Better an old copy than an empty section
    if (cache.data && cache.username === username) {
      return res.json({ data: cache.data, cached: true, stale: true })
    }

    res.status(503).json({ message: 'GitHub repositories are unavailable right now' })
  }
}