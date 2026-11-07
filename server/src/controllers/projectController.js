import Project from '../models/Project.js'

// ---------- Public ----------

// GET /api/projects: only published projects
export async function getPublicProjects(req, res, next) {
  try {
    const projects = await Project.find({ published: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-published -__v')
      .limit(100)
      .lean()

    res.json({ data: projects })
  } catch (error) {
    next(error)
  }
}

// ---------- Admin ----------

const STRING_FIELDS = [
  'title', 'description', 'problemStatement', 'category',
  'imageUrl', 'githubUrl', 'liveUrl',
]
const LIST_FIELDS = ['features', 'technologies']
const BOOLEAN_FIELDS = ['featured', 'published']

// Copies ONLY the fields we allow, and checks their types.
// Anything else the client sends is silently ignored.
function cleanProjectInput(body) {
  const input = body && typeof body === 'object' ? body : {}
  const data = {}
  const errors = []

  for (const field of STRING_FIELDS) {
    if (input[field] === undefined) continue
    if (typeof input[field] !== 'string') errors.push(`${field} must be text`)
    else data[field] = input[field]
  }

  for (const field of LIST_FIELDS) {
    if (input[field] === undefined) continue
    const list = input[field]
    if (!Array.isArray(list) || list.some((item) => typeof item !== 'string')) {
      errors.push(`${field} must be a list of text items`)
    } else {
      data[field] = list.map((item) => item.trim()).filter(Boolean)
    }
  }

  for (const field of BOOLEAN_FIELDS) {
    if (input[field] === undefined) continue
    if (typeof input[field] !== 'boolean') errors.push(`${field} must be true or false`)
    else data[field] = input[field]
  }

  if (input.displayOrder !== undefined) {
    const n = input.displayOrder
    if (!Number.isInteger(n) || n < 0 || n > 10000) {
      errors.push('displayOrder must be a whole number from 0 to 10000')
    } else {
      data.displayOrder = n
    }
  }

  return { data, errors }
}

// GET /api/admin/projects: everything, including drafts
export async function getAllProjects(req, res, next) {
  try {
    const projects = await Project.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-__v')
      .lean()
    res.json({ data: projects })
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/projects/:id
export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).select('-__v').lean()
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ data: project })
  } catch (error) {
    next(error)
  }
}

// POST /api/admin/projects
export async function createProject(req, res, next) {
  try {
    const { data, errors } = cleanProjectInput(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', details: errors })
    }

    const project = await Project.create(data) // the model validates the rest
    res.status(201).json({ data: project })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/admin/projects/:id: send only the fields you want to change
export async function updateProject(req, res, next) {
  try {
    const { data, errors } = cleanProjectInput(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', details: errors })
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    )
    if (!project) return res.status(404).json({ message: 'Project not found' })

    res.json({ data: project })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/admin/projects/:id
export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ message: 'Project deleted' })
  } catch (error) {
    next(error)
  }
}