// Basic node definitions with radial positions (angle, radius)
// Content now imported from centralized content module.
import { about, projects, skills as skillList, experience, certifications, links } from '../content/portfolioContent.jsx';

export const baseNodes = [
  // Top-center (moved close to center ~10% distance)
  { id: 'about', label: 'About Me', angle: 0, radius: 40, type: 'list', content: about },
  // Right-lower (projects) - mirror outward shift to the right
  { id: 'projects', label: 'Projects', angle: 90, radius: 460, type: 'projects', content: projects },
  // Right-middle (skills) - pushed further right to mirror left side
  { id: 'skills', label: 'Skills', angle: 90, radius: 460, type: 'tags', content: skillList.map(s=> s.name) },
  // Left-lower (experience) - moved up slightly and pushed further left
  { id: 'experience', label: 'Experience', angle: 240, radius: 460, type: 'list', content: experience },
  // Left-middle (certifications) - pushed further left
  { id: 'certs', label: 'Certifications', angle: 270, radius: 460, type: 'certs', content: certifications },
  // Just below center (links) - very small radius to sit under the center chip (~10% down)
  { id: 'links', label: 'Links', angle: 180, radius: 40, type: 'links', content: links },
];

export function polarToXY(angleDeg, radius, center) {
  const a = (angleDeg - 90) * Math.PI / 180; // rotate so 0 is up
  return {
    x: center.x + radius * Math.cos(a),
    y: center.y + radius * Math.sin(a)
  };
}
