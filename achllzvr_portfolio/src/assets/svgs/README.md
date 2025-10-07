Drop your SVGs here for icons, logo, and profile pictures.

How to import in components:

- As an inline React component (SVGR via Vite):
  import Logo from '../assets/svgs/logo.svg';
  function My() { return <Logo width={48} height={48} />; }

- As a URL (for img src):
  import profileUrl from '../assets/svgs/profile.svg';
  function MyProfile() { return <img src={profileUrl} alt="profile" />; }

Naming convention:
- logo.svg
- profile.svg
- icon-<name>.svg

This README is auto-generated to help organize your assets.