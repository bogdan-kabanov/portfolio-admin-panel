# Portfolio Admin Panel

React + Vite admin app for editing portfolio content via the [server](../server).

## Quick start

```bash
cd adminka
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:4000
npm run dev                # http://localhost:5174
```

Default credentials match the server defaults: `admin` / `admin123`. Change them
via the server's `.env`.

## Sections

- **Проекты** — CRUD over portfolio projects (RU/EN title and description, cover,
  gallery upload, tech tags, ordering).
- **Навыки** — CRUD over skills with category, level slider and years of experience.
- **Опыт** — CRUD over work experience entries with bilingual role.
- **Профиль** — Name, role, contacts, GitHub username for the public site.

## Build

```bash
npm run build              # outputs to dist/
```
