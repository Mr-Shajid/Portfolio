import { Router } from 'express'
import { getGithubRepos } from '../controllers/githubController.js'

const router = Router()

router.get('/repos', getGithubRepos)

export default router