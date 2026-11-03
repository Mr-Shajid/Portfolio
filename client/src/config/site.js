export const site = {
  name: 'Md. Shahriar Chy Shajid',
  githubUsername: 'Mr-Shajid',

  // Hero text 
  eyebrow: 'CSE Graduate',
  headline: 'Software Quality Assurance & Full-Stack Developer',
  intro:
    'I build web applications with a focus on clean implementation, practical problem-solving, and software quality.',

  // Résumé settings
  resumeFile: '/Md-Shahriar-Chy-Shajid-CV.pdf',
  resumeAvailable: false,

  // About section 
  aboutParagraphs: [
    'I am a Computer Science and Engineering graduate with an interest in building software that works reliably.',
    'I enjoy full-stack development, from designing the interface to building the API and database behind it. I am also interested in software quality assurance, because I like finding problems early and making sure features behave the way they should.',
    'I learn by building projects, reading error messages carefully, and improving things step by step. My goal is to start my career as an SQA or full-stack developer and keep growing from there.',
  ],
  aboutFacts: [
    { label: 'Education', value: 'B.Sc. in Computer Science and Engineering (CSE)', institution: 'American International University-Bangladesh' },
    { label: 'Focus', value: 'Full-stack development, software quality assurance' },
    { label: 'Main stack', value: 'MongoDB, Express, React, Node.js' },
    { label: 'Looking for', value: 'full-stack web developer roles' },
  ],

  // Skills section
  skillCategories: [
    {
      title: 'Frontend development',
      items: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS'],
    },
    {
      title: 'Backend development',
      items: ['Node.js', 'Express.js', 'NestJS'],
    },
    {
      title: 'Databases',
      items: ['MongoDB', 'Mongoose', 'PostgreSQL', 'TypeORM'],
    },
    {
      title: 'API development and testing',
      items: ['REST APIs', 'Postman'],
    },
    {
      title: 'Development tools',
      items: ['Git', 'GitHub'],
    },
    {
      title: 'Software quality assurance',
      items: ['SDLC Methodologies', 'Software Testing Fundamentals'],
    },
  ],

  navLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ],
}

export const githubUrl = `https://github.com/${site.githubUsername}`