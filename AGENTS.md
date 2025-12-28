# Repository Guidelines

## Project Structure & Module Organization
- `conductor/` holds project docs: `product.md`, `tech-stack.md`, `workflow.md`, and code style guides in `conductor/code_styleguides/`.
- Application source code has not been scaffolded yet. When the Next.js app is initialized, place app code at the repo root with a standard `app/` (App Router), `components/`, and `tests/` layout.

## Build, Test, and Development Commands
No build tooling is committed yet (no `package.json`). Once the Next.js app is scaffolded, standard commands should include:
- `npm install`: install dependencies.
- `npm run dev`: start the local dev server.
- `npm run test`: run unit tests (Vitest).
- `npm run lint`: run linting.

## Coding Style & Naming Conventions
- TypeScript follows the Google TypeScript style guide (`conductor/code_styleguides/typescript.md`). Key rules: use `const`/`let` (no `var`), named exports only, semicolons required, single quotes for strings, `UpperCamelCase` for types/classes and `lowerCamelCase` for functions/variables.
- HTML/CSS follow Google HTML/CSS style (`conductor/code_styleguides/html-css.md`): 2-space indentation, lowercase tags/selectors, and hyphenated class names (e.g., `.learning-card`).
- Keep code readable and consistent with existing patterns (`conductor/code_styleguides/general.md`).

## Testing Guidelines
- Preferred frameworks: Vitest + React Testing Library (`conductor/tech-stack.md`).
- TDD is expected: write failing tests before implementation (`conductor/workflow.md`).
- Target >80% coverage for new code.
- Name tests alongside modules (e.g., `components/TrackerCard.test.tsx`).

## Commit & Pull Request Guidelines
- Git history does not yet define a convention (only `initial commit with only git ignore`). Follow the conventional format described in `conductor/workflow.md`, e.g., `feat(ui): Add tracker card`.
- Keep commits scoped and descriptive; include the why in the body when helpful.
- PRs should describe the change, link relevant tasks or issues, and include screenshots for UI changes.

## Workflow & Planning
- Work should be tracked in `plan.md` once introduced; tasks are marked `[ ]` → `[~]` → `[x]` per `conductor/workflow.md`.
- Prefer non-interactive commands and set `CI=true` for watch-based tools when running in automation.
