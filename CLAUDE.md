# Multiplication Table Game

Vite + React 19 + TypeScript. Tests: Vitest + Testing Library (jsdom). Lint: oxlint. Format: oxfmt.

## Commands

- `npm run dev` – dev server
- `npm test` – run tests once (`npm run test:watch` for watch mode)
- `npm run lint` / `npm run lint:fix` – oxlint
- `npm run fmt` / `npm run fmt:check` – oxfmt
- `npm run typecheck` – `tsc -b`
- `npm run check` – all gates (typecheck, lint, fmt:check, test). Run before finishing a change.

## Conventions

- Source in `src/`. Tests colocated as `*.test.tsx` next to the file under test.
- Test setup in `src/test/setup.ts` (jest-dom matchers, auto cleanup).
- No semicolons, single quotes, 100-col width (enforced by oxfmt – don't hand-format, run `npm run fmt`).
- Explicit vitest imports (`describe`, `it`, `expect`); globals are off.
