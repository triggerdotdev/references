# Walkthrough: blank Trigger.dev project → ClickHouse chat agent

The steps to follow on the video, in order. Total flow: create a project in the dashboard, wire up this repo, set the ClickHouse URL as a dashboard env var, run `trigger dev`, and chat with the agent in the playground.

## Before recording (prep, off-camera)

1. **ClickHouse Cloud service with some data in it.** In the ClickHouse Cloud SQL console, load one of the example datasets (e.g. NYC Taxi or UK Property Prices) so the agent has something interesting to query. An empty `default` database makes a boring demo.
2. **Grab the connection URL.** In ClickHouse Cloud: your service → **Connect** → **HTTPS**. You want the host and password; the URL format used here is:
   ```
   https://default:YOUR_PASSWORD@YOUR_SERVICE.REGION.clickhouse.cloud:8443
   ```
   (credentials embedded in the URL — one env var, nothing else to configure)
3. **Anthropic API key** to hand (the agent uses Claude via the AI SDK).
4. `pnpm install` already run in this workspace so you're not watching a progress bar on camera.
5. Log the CLI in: `npx trigger.dev login` (or already logged in).

## On camera

### 1. Create a blank project in the Trigger.dev dashboard

- Dashboard → your org → **New project** (e.g. name it `clickhouse-agent`).
- You land on the empty project page. **Copy the project ref** (`proj_...`).

### 2. Point this repo at the project

```sh
cd references/projects/clickhouse-agent
cp .env.example .env
# paste the project ref:
# TRIGGER_PROJECT_REF=proj_...
```

That's the only local config. Talking point: the code is ~100 lines in `src/trigger/clickhouse-agent.ts`.

### 3. Set the ClickHouse URL in the dashboard

- Dashboard → project → **Environment Variables** → **New environment variable**.
- Name: `CLICKHOUSE_URL`, value: the HTTPS URL from prep step 2. Tick the **Dev** environment (and Prod if you'll deploy at the end).
- Add `ANTHROPIC_API_KEY` the same way.

Talking point: env vars set in the dashboard for the Dev environment are injected into your local `trigger dev` runs — no local `.env` juggling, and the same values are already in place when you deploy.

### 4. Tour the code (optional, ~1 min)

Open `src/trigger/clickhouse-agent.ts` and point at:

- **The ClickHouse client** — `createClient({ url: process.env.CLICKHOUSE_URL })`, the official Node.js client over HTTPS.
- **Three tools** (AI SDK `tool()` with Zod schemas):
  - `listTables` — what data exists (from `system.tables`)
  - `describeTable` — column names/types, via a bound `Identifier` query param (no SQL injection)
  - `runQuery` — read-only SQL: a SELECT-only guard in code, plus `readonly=2`, a 1,000-row cap and a 30s timeout enforced by ClickHouse settings
- **`chat.agent`** — id, tools, and a `run` function that just returns `streamText(...)`. Trigger.dev handles the session, turn loop, streaming, and resumability.

### 5. Run it

```sh
pnpm dev
```

The CLI builds and registers the agent against the project.

### 6. Chat with it in the playground

- Dashboard → **AI agents** (sidebar) → `clickhouse-agent` → open the playground.
- Suggested prompts, in escalating order:
  1. *"What data do I have?"* → watch it call `listTables`
  2. *"What columns does the trips table have?"* → `describeTable`
  3. *"What were the top 10 busiest pickup days? Show a table."* → `runQuery`, streamed answer with a markdown table
  4. Something that makes it self-correct, e.g. ask about a column that doesn't exist — it reads the ClickHouse error and fixes its own SQL. Great moment for the video.
- Click into the run in the dashboard to show the trace: each tool call, its input SQL, and the rows that came back.

### 7. (Optional) Deploy

```sh
pnpm deploy
```

Then flip the playground to the Prod environment and send one more message — same agent, now running on Trigger.dev cloud. (Requires the env vars ticked for Prod in step 3.)

## Troubleshooting

- **"CLICKHOUSE_URL is not set"** in a run → the env var isn't on the Dev environment (or `trigger dev` was started before you added it — restart it).
- **Auth errors from ClickHouse** → password in the URL needs URL-encoding if it contains special characters (`@`, `/`, `:`, `#`).
- **Agent not in the AI agents list** → `pnpm dev` must be running; check it registered `clickhouse-agent` in the CLI output.
