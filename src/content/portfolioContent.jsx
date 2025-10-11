// Centralized portfolio content & metadata.
// Edit this file to update your portfolio data without touching components.

export const about = [
  'Full-Time Student',
  'Full-Stack Mobile Dev',
  'Full-Stack Web Dev',
  'Software Engineer',
  'Content Creator'
];

import ic3Icon from '../assets/certification-icons/IC3.png';
import javaIcon from '../assets/certification-icons/Java.png';
// PDF assets (import so Vite resolves them correctly)
import javaCert from '../assets/certification-certificates/JavaSpecialistCert.pdf';
import ic3Cert from '../assets/certification-certificates/IC3 Certificate.pdf';
import javaBasicsCert from '../assets/certification-certificates/JavaBasics_certificate.pdf';
import htmlCert from '../assets/certification-certificates/HTMLFundamentals_certificate.pdf';
import cssCert from '../assets/certification-certificates/CSSMastery_certificate.pdf';
import sqlCert from '../assets/certification-certificates/SQLFundamentals_certificate.pdf';
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
  { name: 'Java (IT Specialist)', file: javaCert, icon: javaIcon, verify: 'https://www.credly.com/earner/earned/badge/d3041bd5-d4ca-424c-93df-6ff6ee8f8895' },
  { name: 'IC3', file: ic3Cert, icon: ic3Icon, verify: 'https://www.credly.com/earner/earned/badge/1b64d7db-c9d4-41bc-8813-f196f1ebccfc' },
  { name: 'Java (Beginner)', file: javaBasicsCert, icon: '', verify: 'https://www.codecred.dev/verify/2b8e1b7a-1833-4475-b2cd-2fc837d721e0' },
  { name: 'HTML Fundamentals', file: htmlCert, icon: '', verify: 'https://www.codecred.dev/verify/28bffe22-5520-44dc-a6b0-10f6557025b5' },
  { name: 'CSS Mastery', file: cssCert, icon: '', verify: 'https://www.codecred.dev/verify/1446eb12-b922-4bd2-b652-3e7b9cc4e17f' },
  { name: 'SQL Fundamentals', file: sqlCert, icon: '', verify: 'https://www.codecred.dev/verify/e17fafc6-a997-4321-96de-bd57d26bebdf' }
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

// Import real assets where available. If an asset isn't present we fall back to the glyph map above.
import githubSvg from '../assets/svgs/github.svg';
import linkedinSvg from '../assets/svgs/linkedin.svg';
import youtubeSvg from '../assets/svgs/youtube.svg';
import reactSvg from '../assets/svgs/react.svg';
import javaSvg from '../assets/svgs/java.svg';
import androidSvg from '../assets/svgs/android.svg';
import instagramSvg from '../assets/svgs/instagram.svg';
import facebookSvg from '../assets/svgs/facebook.svg';
import gamepadSvg from '../assets/svgs/gamepad.svg';
import fitTrack from '../assets/projects-icons/FitTrack.svg';
import layaa from '../assets/projects-icons/LAYAAI.svg';
import medgenie from '../assets/projects-icons/MedGenie.svg';

export const glyphMap = {
  github: '', // fallback glyphs
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

// Return either a small <img/> node (JSX) or a glyph string. Consumers expect a renderable value.
export function getIcon(key, size = 18) {
  const common = { width: size, height: size, alt: key };
  switch(key) {
    case 'github': return (<img src={githubSvg} {...common} />);
    case 'linkedin': return (<img src={linkedinSvg} {...common} />);
    case 'youtube': return (<img src={youtubeSvg} {...common} />);
    case 'react': return (<img src={reactSvg} {...common} />);
    case 'java': return (<img src={javaSvg} {...common} />);
    case 'android': return (<img src={androidSvg} {...common} />);
    case 'instagram': return (<img src={instagramSvg} {...common} />);
    case 'facebook': return (<img src={facebookSvg} {...common} />);
    case 'gamepad': return (<img src={gamepadSvg} {...common} />);
    // project-specific icons (useful in project cards)
    case 'FitTrack': return (<img src={fitTrack} {...common} />);
    case 'LAYAAI': return (<img src={layaa} {...common} />);
    case 'MedGenie': return (<img src={medgenie} {...common} />);
    default: return glyphMap[key] || '•';
  }
}
