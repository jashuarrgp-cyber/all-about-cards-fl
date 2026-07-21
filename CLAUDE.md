# CLAUDE.md — read this first

Instructions for AI assistants (Claude Code and similar) working in this
repository. The owner is Josh (All About Cards FL LLC). He is not a coder —
explain everything in plain language and handle technical details yourself.

## Session start checklist

1. Read this file, `PROJECT_VISION.md`, and `PROGRESS.md`.
2. Read `AGENTS.md` and skim `README.md` and `docs/` for deeper context.
3. Fetch the latest from GitHub and compare `main` with the working branch —
   Josh sometimes works from more than one computer.
4. Check recent commits and open pull requests.
5. Summarize where things stand in plain language and wait for Josh's
   go-ahead before building.

## Hard rules

- **Plain language only** when talking to Josh. No jargon without a quick
  explanation.
- **Never merge a pull request without Josh's explicit approval.**
- **Never say something is done, pushed, or passing unless you actually
  verified it** (run the command, check the output, look at the screen).
- Visual work must be verified visually: run the app, screenshot it at phone
  size, and show Josh before calling it finished.
- Never show internal cost or profit on collector/public-facing screens.
- Never fake data silently. Sample/placeholder values are fine but must be
  clearly labeled as sample in the UI.
- Keep `PROGRESS.md` updated at the end of every working session.

## Technical quick facts

- Next.js 15 App Router + React 19 + strict TypeScript + Tailwind CSS.
- PostgreSQL via Prisma (`prisma/schema.prisma`); decimal-safe money; the
  inventory data model is built and merged (Phase 2).
- Auth: NextAuth v5 beta; server-side permission checks in
  `src/lib/auth/` — every internal page calls `requirePermission(...)`.
- The mobile collector experience lives under `src/app/app/` (routes) and
  `src/components/app/` + `src/components/portfolio/` (UI).
- Labeled design previews (no login, sample data only) live under
  `src/app/preview/`.
- Useful commands: `npm run typecheck`, `npm run lint`, `npm run format`,
  `npm test`, `npm run build`. Run all of these before pushing.
- The database is usually NOT reachable in dev/CI environments — server
  queries must degrade gracefully to labeled sample data (see
  `src/lib/portfolio/queries.ts` for the pattern).

## Working branch

Development happens on `claude/all-about-cards-sync-yhsp8x` unless Josh
says otherwise. Push there; open PRs against `main`; let Josh approve merges.
