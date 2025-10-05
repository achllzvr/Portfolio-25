// Centralized portfolio content & metadata.
// Edit this file to update your portfolio data without touching components.

export const about = [
  'Full-Time Student',
  'Full-Stack Mobile Dev',
  'Full-Stack Web Dev',
  'Software Engineer',
  'Content Creator'
];

export const projects = [
  { id: 'nutify', title: 'NUtify', blurb: 'Nutrition tracking mobile app', stack: ['Flutter','Firebase'], description: 'Longer description placeholder. Add goals, tech decisions, and outcomes here.' },
  { id: 'tabulation', title: 'NU LP Tabulation 2025', blurb: 'Event scoring system', stack: ['React','Node','MongoDB'], description: 'Details about scalability, real-time features, etc.' },
  { id: 'laya', title: 'LAVA AI', blurb: 'AI productivity suite', stack: ['Next.js','Python','PostgreSQL'], description: 'Explain AI integrations and pipelines.' },
  { id: 'medgenie', title: 'MedGenie', blurb: 'Healthcare assistant', stack: ['React Native','Supabase'], description: 'Discuss privacy and healthcare compliance aspects.' },
];

export const experience = [
  'Full Stack Mobile Developer – NUtify',
  'Front-End Developer – LAVA AI',
  'CEO & PM – iNUvators',
  'Project Manager – MedGenie'
];

export const certifications = [
  { name: 'AWS Cloud Practitioner (prep)', link: '' },
  { name: 'Google Analytics (example)', link: '' },
  { name: 'SCRUM Fundamentals', link: '' }
];

export const links = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/', icon: 'github' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' },
  { id: 'email', label: 'Email', href: 'mailto:example@example.com', icon: 'mail' }
];

export const skills = [
  { name: 'React', icon: 'react' },
  { name: 'Node.js', icon: 'node' },
  { name: 'Tailwind', icon: 'tailwind' },
  { name: 'Flutter', icon: 'flutter' },
  { name: 'MySQL', icon: 'mysql' },
  { name: 'MongoDB', icon: 'mongodb' },
  { name: 'REST', icon: 'api' },
  { name: 'GraphQL', icon: 'graphql' },
  { name: 'Docker', icon: 'docker' }
];

// Simple icon lookup (replace strings with imported SVGs/images if desired)
export const iconMap = {
  github: '', // placeholder glyphs / can swap with SVG components
  linkedin: '',
  youtube: '',
  mail: '✉',
  react: '⚛',
  node: '⬢',
  tailwind: '🌀',
  flutter: '🦋',
  mysql: '🐬',
  mongodb: '🍃',
  api: '🔗',
  graphql: '◆',
  docker: '🐳'
};

export function getIcon(key) { return iconMap[key] || '•'; }
