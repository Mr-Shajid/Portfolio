// TEMPORARY DATA. In Phase 4 these will come from MongoDB through the API.
// The fields below match the planned database model.
export const sampleProjects = [
  {
    _id: '1',
    title: 'Personal Portfolio Website',
    description:
      'The website you are looking at: a responsive MERN portfolio with a theme toggle and, in later phases, an admin dashboard for managing projects.',
    problemStatement:
      'A portfolio that can be updated without editing source code each time a project changes.',
    features: [
      'Light and dark themes',
      'Responsive layout',
      'Admin dashboard (in progress)',
    ],
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Express', 'MongoDB'],
    category: 'Full-stack',
    imageUrl: '',
    githubUrl: 'https://github.com/Mr-Shajid/Portfolio',
    liveUrl: '',
    featured: true,
    displayOrder: 1,
  },
  {
    _id: '2',
    title: 'Sample project (delete me)',
    description:
      'A temporary entry with no links, used only to check how the layout handles missing images and links.',
    problemStatement: '',
    features: [],
    technologies: ['Placeholder'],
    category: 'Sample',
    imageUrl: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    displayOrder: 2,
  },
]