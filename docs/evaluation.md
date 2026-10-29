# OAuth Pathfinder evaluation

Evaluation date: 2026-10-28 (UTC)

## Access and method

The application was inspected locally and tested with its unit tests, lint, TypeScript check, and production build. Direct requests to GitHub Docs, Google Developers, Slack API docs, and Notion Developers returned HTTP tunnel 403 from the managed environment, so page contents could not be independently inspected during this run. No provider console interaction occurred. `OPENAI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` were absent, so genuine generation, save/retrieve/refresh, and an unfamiliar generated-provider evaluation could not be run. Official URLs below are the links currently embedded in seed records; they have not been re-opened for this report.

## Provider checks

| Provider | Claim checked | Official source | Method / confirmation | Correction or remaining unknown | Console interaction |
| --- | --- | --- | --- | --- | --- |
| GitHub | OAuth Apps and GitHub Apps are different integration models; Marketplace listing is a distinct distribution path. | [About GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps), [Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) | Inspected the existing guide structure and official source URLs; live docs inaccessible (proxy 403). | Removed unconditional “public HTTPS callback” claim and softened exact redirect matching. No OAuth setup/review SLA asserted. Marketplace listing requirements remain unverified in this environment. | No |
| Google Drive | Verification depends on OAuth audience and scope classifications; it is not universal for every Drive integration. | [OAuth consent configuration](https://developers.google.com/workspace/guides/configure-oauth-consent), [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2), [OAuth app verification](https://support.google.com/cloud/answer/9110914) | Compared guide prose against linked sources and corrected universal/billing/trailing-slash wording; docs fetch blocked. | Removed billing as a universal prerequisite, removed the absolute trailing slash statement, made verification conditional on scopes/audience, and marked duration unknown. Scope-specific consequences need a successful current-doc review. | No |
| Slack | Workspace installation and Marketplace listing are different; scopes depend on API use. | [OAuth v2](https://api.slack.com/authentication/oauth-v2), [App distribution](https://api.slack.com/start/distributing) | Code/content review against embedded official URLs; live docs fetch blocked. | Clarified that listing is optional for workspace installs; review and wait duration remain unverified/unknown. Callback exact-match detail remains to be checked live. | No |
| Notion | Internal integrations are workspace-scoped; public integrations use OAuth for other workspaces; capabilities and explicitly shared content constrain access. | [Authorization](https://developers.notion.com/docs/authorization), [Capabilities](https://developers.notion.com/reference/capabilities) | Reviewed existing guide and citation targets; official doc fetch blocked. | Qualified review as distribution-dependent rather than universal, made redirect-rule details explicitly source-dependent, and retained page-sharing as a prerequisite. Public review conditions/timing remain unconfirmed. | No |
| Unfamiliar provider | Live provider resolution, OAuth assessment, source citation, persisted URL, and retrieval. | No source available because no live run occurred. | Not testable: required OpenAI and Supabase credentials are absent. API correctly returns configuration errors; no provider-specific result was fabricated. | The real-generation path and unfamiliar-provider claims remain unverified. | No |

## UX, security, and robustness checks

- Unit coverage validates seeded guide schema, unsupported output shape, bad evidence references, invalid completed failure data, missing guide lookup, successful stored-guide deserialization, and database read errors.
- Homepage search, library filters, mobile rendering, generation/loading milestones, and copy/navigation interactions were not browser-automated in this evaluation.
- Missing `OPENAI_API_KEY` is handled as a visible configuration error; malformed guide ID returns 404 through the guide API. A Supabase read outage displays a storage-unavailable state rather than not-found.
- Static build chunks were searched for `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`; neither appeared. This is a build artifact check, not a full deployed network/security audit.
- The server does not fetch the user-supplied provider URL. Inputs are constrained to names or public HTTPS URL forms and local/private targets are rejected; search uses the OpenAI web-search tool.
- Research prompts explicitly treat retrieved pages as untrusted and instruct the model not to follow page instructions. No end-to-end adversarial prompt-injection experiment was possible without live research credentials.
- No OAuth client secrets are represented in the guide schema. Supabase JSONB writes pass through Zod and evidence-reference validation.

## Test and build results

- `npm test`: passed, 7 tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Provider docs live fetch: blocked for all four providers by outbound proxy HTTP 403.
- Live research and Supabase persistence round trip: not run (credentials unavailable).

## Corrections made and outstanding

Corrected seed guidance to avoid universal Google billing/verification requirements, absolute Google/Slack/GitHub redirect assertions, and an implication that Slack/Notion marketplace review is always required. Provider guide sources are marked unverified until a real source review is run; approval durations remain unknown. Added evidence-reference checking to guide validation and made research output status discriminated so a failed outcome cannot parse as completed.

The most important remaining issue is lack of a successful live-source and database-backed test. Seed citations must be reopened and claim-matched when outbound access and credentials are available. Managed OAuth availability for all seeded providers remains unknown rather than inferred. No manual provider-console action was performed.
