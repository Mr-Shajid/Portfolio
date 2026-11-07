import { Router } from 'express'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { csrfSynchronisedProtection } from '../middleware/csrf.js'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js'

const router = Router()

// Every route below needs a logged-in admin, and changes need a CSRF token
router.use(requireAdmin, csrfSynchronisedProtection)

router.get('/', getAllProjects)
router.get('/:id', getProjectById)
router.post('/', createProject)
router.patch('/:id', updateProject)
router.delete('/:id', deleteProject)

export default router