# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Portfolio Content Editing

All dynamic portfolio data (About, Projects, Experience, Skills, Certifications, Links) is centralized in `src/content/portfolioContent.js`.

### Sections
- `about`: Array of short lines.
- `projects`: Each project has `id`, `title`, `blurb`, `stack`, and an extended `description` placeholder.
- `experience`: Bullet lines for roles.
- `certifications`: Objects `{ name, link }` (leave `link` empty if none).
- `links`: Social/contact links with `icon` keys.
- `skills`: Each skill has `name` and `icon`.

### Icons
`iconMap` maps simple keys to placeholder glyphs. Replace with imported SVG components or images if desired.

### Adding a Certification
```js
certifications.push({ name: 'New Cert Name', link: 'https://verify.example.com/abc' });
```

### Adding a Skill with a Custom Icon
1. Add an SVG component (e.g. `MyIcon.jsx`).
2. Import & map it inside `iconMap`.
3. Add `{ name: 'My Skill', icon: 'myIcon' }` to `skills`.

### Projects Grid Width
The Projects node expands to a wider grid automatically (`w-[28rem]`). Adjust in `ChipNode.jsx` where `node.id==='projects'` logic lives.

### Live Reload
Editing `portfolioContent.js` triggers hot reload; no component changes needed.

---
