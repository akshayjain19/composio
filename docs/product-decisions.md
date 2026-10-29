# Product decisions

OAuth Pathfinder is intentionally an evidence-oriented decision aid rather than a directory that implies completeness.

## Why these four providers

GitHub, Google Drive, Slack, and Notion cover distinct integration models: code hosting, cloud storage, workspace collaboration, and productivity content. Their differences make the setup questions visible without suggesting that a small seed set represents every provider.

## Why live generation instead of 100 static guides

Provider coverage changes often and a static catalog requires recurring research to stay trustworthy. Live generation lets a developer ask about an unfamiliar provider and receive a bounded result with citations and explicit gaps. Seed guides demonstrate the product and remain clearly distinguished from freshly generated research.

## Why official-source evidence comes first

Scopes, redirect rules, review pathways, and policies are provider-controlled. Official documentation is the most direct evidence for those claims. Search snippets or secondary sources may help discovery, but they should not be presented as policy proof. A citation must support its claim; a link alone is not validation.

## Why setup and approval wait are separate

Hands-on configuration effort and external review time have different causes and uncertainty. Combining them would make a low-complexity integration look fast even when review timing is unknown, or imply provider SLAs that are not published. The product labels implementation effort as an estimate and approval wait as documented, estimated, or unknown.

## Why managed and custom OAuth are separate

Managed OAuth can remove app registration work, but provider support can vary by scopes, account type, and use case. Custom OAuth gives the developer control over an app registration and credentials but can add console and distribution work. The product should establish managed availability from evidence instead of inferring it from provider popularity.

## Why uncertainty is visible

Provider requirements vary by audience, app type, scope sensitivity, and distribution channel. Showing unknowns and limitations helps the developer decide what to verify before investing engineering time. It is more useful than false precision.

## Why credentials and automatic approvals are excluded

OAuth client secrets belong in the developer’s secure provider configuration, never in a research guide or browser response. Provider-console actions can involve account ownership, legal representations, privacy disclosures, fees, and binding approval decisions. The product can prepare configuration work, but a developer must retain control of credentials and submit/approve provider reviews.
