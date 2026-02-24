# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 16 + TypeScript admin app using the App Router and a colocated feature structure.

- `src/app/`: routes, layouts, API routes (`api/auth`, `api/upload`)
- `src/app/(main)/dashboard/*`: dashboard features and per-feature `_components`
- `src/components/`: shared components (`ui/` primitives, `data-table/` helpers)
- `src/services/`, `src/hooks/`, `src/lib/`: API/services, reusable hooks, utilities
- `src/styles/presets/`: theme preset CSS files
- `src/types/`: shared TypeScript models
- `public/` and `media/`: static assets

Use the `@/*` alias for imports from `src` (see `tsconfig.json`).

## Build, Test, and Development Commands
- `npm run dev`: start local dev server at `http://localhost:3000`
- `npm run build`: production build (good pre-PR validation)
- `npm run start`: run built app
- `npm run lint`: run ESLint rules
- `npm run format` / `npm run format:check`: format or check formatting with Prettier
- `npm run generate:presets`: regenerate theme preset typings

Pre-commit hooks run `npm run generate:presets`, stage generated theme types, then run `lint-staged`.

## Coding Style & Naming Conventions
- TypeScript-first; keep `strict` compatibility and avoid `any`
- Prettier: 2-space indent, semicolons, double quotes, trailing commas
- ESLint enforces `kebab-case` file names (except config and `.d.ts`)
- Prefer small modules, clear imports, and no unresolved or cyclic imports
- Keep route-level code colocated under its feature folder (for example, `src/app/(main)/dashboard/venues/`)

## Testing Guidelines
There is currently no dedicated `npm test` suite in this repository. Until one is added:

- Treat `npm run lint` and `npm run build` as required checks
- For UI-heavy changes, include manual verification steps in the PR
- If adding tests, place them near the feature (`*.test.ts[x]` or `*.spec.ts[x]`) and document the run command

## Commit & Pull Request Guidelines
Recent commit history uses concise, imperative subjects (for example: `Add ...`, `Refactor ...`, `Update ...`).

- Keep commit titles short, specific, and action-oriented
- Optional conventional prefixes are acceptable (`feat:`, `fix:`, `chore:`)
- PRs should include: change summary, related issue/context, and screenshots for UI changes
- Ensure your branch is current with `main` and passes lint/build before review

## Security & Configuration Tips
- Keep secrets in `.env.local` only; do not commit env files
- `NEXT_PUBLIC_BACKEND_URL` is required for `/be/:path*` rewrite targets in `next.config.mjs`
