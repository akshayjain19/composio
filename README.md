# OAuth Pathfinder

OAuth Pathfinder helps developers understand the work involved in connecting an application through OAuth: how to start, what to configure, what may need provider review, and which claims are documented versus estimated or unknown.

**Know the path before you build.**

## Demo and repository

- Live demo: not deployed yet.
- Repository: [akshayjain19/composio](https://github.com/akshayjain19/composio) (the configured origin; the current working changes have not been pushed).

## The problem

Provider OAuth setup is spread across developer documentation, cloud consoles, scope tables, and distribution policies. A developer can finish the callback implementation and still be blocked by verification, workspace controls, or a distribution requirement. Pathfinder makes those paths and uncertainties visible before integration work starts.

## Tech stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Zod for guide and request validation
- OpenAI Responses API with web search for live provider research
- Supabase Postgres for immutable generated guides and research-run metadata
- Vitest for focused schema and storage tests

## Architecture

Seed guides and generated guides share a structured Zod schema. `/api/research` validates input, checks for a saved guide, runs research when needed, validates citations and data, and persists a new guide before returning its permanent ID. Generated guides are server-rendered at `/guides/{id}` from Supabase; viewing a share link does not invoke the model. The OpenAI and Supabase service credentials are used only by server code. SQL migrations are under `supabase/migrations`.

## Local setup

Requires Node.js 20.9+ and npm.

```bash
npm ci
cp .env.example .env.local
# Set the server variables described below in .env.local
npm run dev
```

Open `http://localhost:3000`. Without credentials the reference library remains available; live research and saved guide reads require configured services.

## Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | Live research | Server-only OpenAI project key with Responses API and web search access. |
| `OPENAI_MODEL` | Optional override | Responses API model enabled for the project; defaults to `gpt-5.5`. |
| `SUPABASE_URL` | Saved guides and research | Supabase project URL, server-side. |
| `SUPABASE_SERVICE_ROLE_KEY` | Saved guides and research | Service-role key; server-only, never use a `NEXT_PUBLIC_` name. |

Do not commit `.env.local` or place secrets in source files, guides, or browser code.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/migrations/202610280001_oauth_guides.sql`](supabase/migrations/202610280001_oauth_guides.sql) in the project SQL Editor.
3. In Project Settings → API, copy the project URL and service-role key to `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the server environment.
4. Configure `OPENAI_API_KEY` to enable real research.
5. Restart/redeploy and test a provider not in the seed library. Successful research creates an immutable guide record; the returned `/guides/{uuid}` URL can be opened without login.

RLS is enabled and there are no anonymous table policies. Browser clients do not connect to Supabase directly; server handlers mediate reads and writes.

## How live research works

The server uses the Responses API web-search tool to resolve the provider and discover documentation, then formats the research as strict structured output. Citation annotations become the source list; the guide is validated against Zod and evidence IDs before it can be saved. Missing/invalid evidence, unavailable credentials, or storage failures produce an error rather than a fabricated successful guide. The server does not fetch user-submitted URLs directly. Milestones are streamed to the existing research UI.

## Example providers

The initial library includes GitHub, Google Drive, Slack, and Notion. Seed pages provide a starting map, not a claim that an app is registered, approved, or freshly re-verified. Approval requirements depend on app type, use case, scopes, audience, and distribution path.

## Product decisions

- Four diverse examples cover code hosting, storage, team collaboration, and productivity without suggesting a broad library has been completed.
- Live generation addresses unfamiliar providers directly; a large catalog of static guides would become stale and cannot cover every provider.
- Official-source evidence is prioritized because OAuth and verification policy are provider-specific. Unsupported claims stay qualified.
- Setup effort and external approval wait are separate: engineering work can be estimated, while provider review timing often has no guaranteed SLA.
- Managed OAuth and custom OAuth are separate paths; availability must be established for the provider, scopes, and use case.
- Unknowns remain visible so developers do not confuse estimates with policy or assume approvals are complete.
- Credential collection and automatic provider-console approval are excluded. Developers own provider accounts, secrets, legal disclosures, and approval submissions.

## Testing and evidence methodology

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`. Tests cover schema validation, invalid evidence references, unsupported/failed results, missing guide reads, successful stored guide deserialization, and database read errors. Seed and generated source links should be checked against the claims they support; a URL by itself is not proof. Live provider-console tests are not claimed unless performed manually.

The evaluation log at [`docs/evaluation.md`](docs/evaluation.md) records checks performed and access limitations. In the current environment provider documentation requests were blocked by the outbound proxy, and no OpenAI or Supabase credentials were available, so live research/persistence and a public deployment have not been verified.

## Known limitations

- No live demo is deployed yet; required deployment credentials and service secrets are not configured in this workspace.
- Provider links and seed claims need a fresh official-source review before production use.
- Live generation and permanent save/retrieve flows need an OpenAI key and Supabase project to verify end to end.
- The rate limiter is in-memory and per process; use shared throttling before a multi-instance public launch.
- Provider-console interactions and approval timing are not automated or guaranteed.

## Future improvements

- Deploy to Vercel and validate public routes with production credentials.
- Re-check seeded claims against current official documentation and add claim-level source associations.
- Add shared request throttling, observability, and retention controls for research runs.
- Add richer provider identity disambiguation and a review workflow for generated evidence.
