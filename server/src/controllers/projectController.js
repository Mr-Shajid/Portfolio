import Project from '../models/Project.js'

// GET /api/projects: public. Returns only published projects.
export async function getPublicProjects(req, res, next) {
  try {
    const projects = await Project.find({ published: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-published -__v') // visitors do not need these fields
      .limit(100)
      .lean() // plain objects, faster for read-only data

    res.json({ data: projects })
  } catch (error) {
    next(error) // hands the error to the central error handler
  }
}