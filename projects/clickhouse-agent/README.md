# clickhouse-agent

A minimal Trigger.dev `chat.agent` with tools for querying ClickHouse Cloud via the official [Node.js ClickHouse client](https://clickhouse.com/docs/integrations/javascript). Built for a hackathon walkthrough video — the full recording script is in [WALKTHROUGH.md](./WALKTHROUGH.md).

## What's in it

- `src/trigger/clickhouse-agent.ts` — the whole demo:
  - `listTables` / `describeTable` / `runQuery` tools (read-only, row-capped, 30s query timeout)
  - a `chat.agent` that wires those tools into Claude via the AI SDK

## Setup

```sh
cp .env.example .env   # paste your TRIGGER_PROJECT_REF
pnpm install
pnpm dev
```

Set `CLICKHOUSE_URL` and `ANTHROPIC_API_KEY` in the Trigger.dev dashboard (Environment Variables → Dev environment):

```
CLICKHOUSE_URL=https://default:YOUR_PASSWORD@YOUR_SERVICE.clickhouse.cloud:8443
```

Then chat with `clickhouse-agent` in the dashboard's AI agents playground.
