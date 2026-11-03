import { sampleProjects } from '../data/sampleProjects'

// Right now this returns local sample data.
// In Phase 4 we will replace the body with a fetch() call to our Express API.
// The rest of the app will not need to change.
export async function getProjects() {
  return sampleProjects
}