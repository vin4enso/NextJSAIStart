# AI Agents Guide

## Project Documentation

All project documentation is in `docs/`. Every agent MUST read relevant docs before starting work:

| File                           | Content                                             |
| ------------------------------ | --------------------------------------------------- |
| `docs/00_VISION.md`            | Project goals and principles                        |
| `docs/01_ARCHITECTURE.md`      | Tech stack, shell, access control layers            |
| `docs/02_PROJECT_STRUCTURE.md` | Directory layout, naming conventions, menu config   |
| `docs/03_DATABASE.md`          | Drizzle schema, tables, seed, soft delete           |
| `docs/04_AUTH.md`              | Better Auth config, routes, middleware              |
| `docs/05_RBAC.md`              | Permission model, System role, guard hierarchy      |
| `docs/06_API.md`               | REST endpoints, unified response format, services   |
| `docs/07_UI_KIT.md`            | Components: PageHeader, AppTable, DataToolbar, etc. |
| `docs/08_PAGES.md`             | All pages by layout group, page meta pattern        |
| `docs/09_I18N.md`              | next-intl, message structure, usage                 |
| `docs/10_AI_GUIDELINES.md`     | Strict code generation rules                        |
| `docs/11_DEVELOPMENT.md`       | Setup, scripts, Docker, testing                     |
| `docs/12_ENTITY_TEMPLATE.md`   | Template for adding new CRUD entities               |

## External Documentation

If you encounter problems or have questions about the libraries used in this project, consult their official documentation:

| Library     | Docs (llms.txt)                   |
| ----------- | --------------------------------- |
| Drizzle ORM | https://orm.drizzle.team/llms.txt |
| Better Auth | https://better-auth.com/llms.txt  |
| Next.js     | https://nextjs.org/docs/llms.txt  |

Agents MUST read the relevant documentation before troubleshooting or implementing features using these libraries.

## Required Skills

ALWAYS load these skills before implementation:

- `vercel-react-best-practices` — React/Next.js performance optimization
- `vercel-composition-patterns` — Component composition patterns
- `vercel-optimize` — Cost and performance optimization
- `deploy-to-vercel` — Vercel deployment

## Workflow

### 1. Issue Management

Before starting work, check if an issue exists for the task:

```bash
gh issue list
```

If no issue exists, create one:

```bash
gh issue create \
  --title "feat: <short description>" \
  --body "Full description of the task" \
  --label enhancement
```

### 2. Branching

Always create a feature branch from `master` before writing code:

```bash
git checkout master
git pull origin master
git checkout -b feat/<issue-number>-<short-description>
```

Branch naming:

- `feat/<number>-<description>` — new features
- `fix/<number>-<description>` — bug fixes
- `docs/<number>-<description>` — documentation

### 3. Implementation

- Follow `docs/10_AI_GUIDELINES.md` strictly
- Read relevant `docs/` files before each task
- Use the required skills listed above
- Run lint and typecheck before committing

### 4. Pull Request

After implementation, create a PR:

```bash
gh pr create \
  --title "feat: <description>" \
  --body "Closes #<issue-number>\n\n## Changes\n- ..." \
  --base master
```

PR body MUST include:

- `Closes #<issue-number>`
- Summary of changes
- Screenshots for UI changes (if applicable)

### 5. Verification

Always run these before pushing:

```bash
npm run lint
npm run typecheck
npm run i18n:check
npm run build
npm run test
```

## Communication

- Use English for all commit messages, PRs, and issues
- Use Russian or English for inline code comments (prefer self-documenting code)
