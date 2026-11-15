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

    const baseHeaders = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-site', // GitHub requires a User-Agent
      'X-GitHub-Api-Version': '2022-11-28',
    }

    // Optional token: gives a much higher rate limit. It stays on the server.
    const token = process.env.GITHUB_TOKEN

    function request(useToken) {
      return fetch(url, {
        headers: useToken
          ? { ...baseHeaders, Authorization: `Bearer ${token}` }
          : baseHeaders,
        signal: controller.signal,
      })
    }

    let response = await request(Boolean(token))

    // An expired or wrong token gets 401 even for public data.
    // Fall back to anonymous access instead of failing.
    if (response.status === 401 && token) {
      console.error('GitHub rejected GITHUB_TOKEN (expired or invalid). Using anonymous access.')
      response = await request(false)
    }

    if (!response.ok) {
      // Rate limit info helps diagnose 403 errors. It is not a secret.
      const remaining = response.headers?.get?.('x-ratelimit-remaining')
      const detail =
        remaining !== null && remaining !== undefined
          ? ` (rate limit remaining: ${remaining})`
          : ''
      throw new Error(`GitHub responded with status ${response.status}${detail}`)
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