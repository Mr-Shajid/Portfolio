import mongoose from 'mongoose'
import { isHttpUrl } from '../utils/isHttpUrl.js'

// A reusable definition for the three URL fields
const urlField = {
  type: String,
  trim: true,
  maxlength: [500, 'URL must be 500 characters or fewer'],
  default: '',
  validate: {
    validator: isHttpUrl,
    message: 'Must be a valid http or https URL',
  },
}

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be 100 characters or fewer'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description must be 500 characters or fewer'],
    },
    problemStatement: {
      type: String,
      trim: true,
      maxlength: [500, 'Problem statement must be 500 characters or fewer'],
      default: '',
    },
    features: {
      type: [{ type: String, trim: true, maxlength: 150 }],
      default: [],
      validate: {
        validator: (list) => list.length <= 10,
        message: 'A project can have at most 10 features',
      },
    },
    technologies: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      default: [],
      validate: {
        validator: (list) => list.length <= 15,
        message: 'A project can have at most 15 technologies',
      },
    },
    category: {
      type: String,
      trim: true,
      maxlength: [40, 'Category must be 40 characters or fewer'],
      default: 'General',
    },
    imageUrl: urlField,
    githubUrl: urlField,
    liveUrl: urlField,
    featured: { type: Boolean, default: false },
    // Draft by default: a project is only public after you publish it
    published: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0, min: 0 },
  },
  // Mongoose adds createdAt and updatedAt automatically
  { timestamps: true }
)

// Speeds up the public query: published projects in display order
projectSchema.index({ published: 1, displayOrder: 1 })

export default mongoose.model('Project', projectSchema)