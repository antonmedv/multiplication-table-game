# Multiplication Table Game

React + TypeScript game built with Vite.

## Stack

- [Vite](https://vite.dev/) – dev server and bundler
- [React 19](https://react.dev/) + TypeScript
- [Vitest](https://vitest.dev/) + Testing Library – unit/component tests (jsdom)
- [oxlint](https://oxc.rs/docs/guide/usage/linter) – linting
- [oxfmt](https://oxc.rs/docs/guide/usage/formatter) – formatting

## Scripts

| Command                 | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Start dev server with HMR               |
| `npm run build`         | Typecheck + production build to `dist/` |
| `npm run preview`       | Serve the production build locally      |
| `npm test`              | Run tests once                          |
| `npm run test:watch`    | Run tests in watch mode                 |
| `npm run test:coverage` | Run tests with V8 coverage report       |
| `npm run lint`          | Lint with oxlint                        |
| `npm run lint:fix`      | Lint and auto-fix                       |
| `npm run fmt`           | Format all files with oxfmt             |
| `npm run fmt:check`     | Check formatting without writing        |
| `npm run typecheck`     | Run `tsc -b` only                       |
| `npm run check`         | typecheck + lint + fmt:check + test     |
