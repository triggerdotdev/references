# references

Example projects for [Trigger.dev](https://trigger.dev). Each one exercises the
`@trigger.dev/*` packages - SDK features, build extensions, framework adapters -
and several are referenced from the docs.

## Layout

```
projects/    reference projects (each is its own package)
packages/    shared packages projects depend on (added as needed)
```

Projects depend on published `@trigger.dev/*` versions, so they run without a
local checkout of the framework.

## Setup

Requires Node `20.20.2` and pnpm `10.33.2` (pnpm provisions Node automatically).

```bash
pnpm install
```

## Running a project

```bash
cd projects/hello-world
pnpm exec trigger login        # add -a <url> to target a self-hosted instance
pnpm exec trigger dev
```

> Running against a local self-hosted instance? The instance needs a project
> matching each project's ref. The trigger.dev monorepo's `pnpm run db:seed`
> pre-creates `hello-world`, `d3-chat`, and `realtime-streams` (for the latter two,
> set `TRIGGER_PROJECT_REF` in their `.env` per the seed output). For any other
> project, create one in the dashboard and update its `project` ref in
> `trigger.config.ts`. These refs must stay in sync with that seed.

## Adding a project

1. Copy an existing project under `projects/`.
2. Update its `package.json` `name` and the `project` ref in `trigger.config.ts`.
3. Run `pnpm install` from the repo root.

## Local development: linking the framework

To run a project against a local checkout of the trigger.dev monorepo instead of
the published packages (e.g. to test unreleased SDK changes):

```bash
pnpm run link      # prompts for your monorepo path on first run, then links
pnpm run unlink    # restore the published versions
```

`trigger dev` bundles from each package's built `dist/`, so build the monorepo
packages first (`pnpm run build --filter trigger.dev --filter "@trigger.dev/*"`)
or run them in watch mode - linking to an unbuilt package uses stale output.

Your monorepo path is saved to a gitignored `.trigger-monorepo-path`, so the
checkout can live anywhere. A `pre-push` hook unlinks automatically, so a linked
state is never committed.
