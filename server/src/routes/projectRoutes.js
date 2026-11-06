import { Router } from 'express'
import { getPublicProjects } from '../controllers/projectController.js'

const router = Router()

router.get('/', getPublicProjects)

export default router