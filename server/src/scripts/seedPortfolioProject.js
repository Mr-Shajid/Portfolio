import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Project from '../models/Project.js'

async function run() {
  await connectDB()

  const githubUrl = 'https://github.com/Mr-Shajid/Portfolio'
  const existing = await Project.findOne({ githubUrl })

  if (existing) {
    console.log('Portfolio project already exists. Nothing changed.')
  } else {
    await Project.create({
      title: 'Personal Portfolio Website',
      description:
        'A responsive MERN portfolio with a light and dark theme and, in later phases, an admin dashboard for managing projects.',
      problemStatement:
        'A portfolio that can be updated without editing source code each time a project changes.',
      features: ['Light and dark themes', 'Responsive layout', 'Admin dashboard (in progress)'],
      technologies: ['React', 'Vite', 'Tailwind CSS', 'Express', 'MongoDB'],
      category: 'Full-stack',
      githubUrl,
      featured: true,
      published: true,
      displayOrder: 1,
    })
    console.log('Portfolio project created.')
  }

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})