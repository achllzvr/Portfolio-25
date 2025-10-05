// Basic node definitions with radial positions (angle, radius)
// Content now imported from centralized content module.
import { about, projects, skills as skillList, experience, certifications, links } from '../content/portfolioContent.js';

export const baseNodes = [
  { id: 'about', label: 'About Me', angle: 225, radius: 340, type: 'list', content: about },
  { id: 'projects', label: 'Projects', angle: 330, radius: 350, type: 'projects', content: projects },
  { id: 'skills', label: 'Skills', angle: 120, radius: 340, type: 'tags', content: skillList.map(s=> s.name) },
  { id: 'experience', label: 'Experience', angle: 30, radius: 330, type: 'list', content: experience },
  { id: 'certs', label: 'Certifications', angle: 260, radius: 360, type: 'certs', content: certifications },
  { id: 'links', label: 'Links', angle: 150, radius: 360, type: 'links', content: links },
];

export function polarToXY(angleDeg, radius, center) {
  const a = (angleDeg - 90) * Math.PI / 180; // rotate so 0 is up
  return {
    x: center.x + radius * Math.cos(a),
    y: center.y + radius * Math.sin(a)
  };
}
