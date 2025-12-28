# Repository Guidelines

## Project Structure & Module Organization
- `conductor/` holds project docs: `product.md`, `tech-stack.md`, `workflow.md`, and code style guides in `conductor/code_styleguides/`.
- Next.js App Router source lives in `src/app/` with the global styles in `src/app/globals.css`.
- Shared UI and domain modules should go in `src/components/` and `src/lib/` as they are introduced.
- Static assets belong in `public/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local Next.js dev server.
- `npm run build`: build the production bundle.
- `npm run start`: run the production server after a build.
- `npm run lint`: run ESLint.
- Tests are not wired yet; use `npm run test` once Vitest is added.

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
