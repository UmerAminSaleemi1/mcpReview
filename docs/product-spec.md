# Product specification

## Product summary

mcplist.com is an evidence-based directory and editorial review platform for Model Context Protocol (MCP) servers. The project helps developers discover MCP servers, compare capabilities, and understand what has actually been tested before connecting a tool or workflow.

## Primary audience

- Developers evaluating MCP tools for AI assistants and automation workflows.
- Teams deciding which server is the right fit for a client or use case.
- Editors and maintainers reviewing factual claims, pricing, permissions, and compatibility data.

## Core user journeys

1. Browse a curated list of MCP servers.
2. Search and filter by category, client support, hosting, price, and review status.
3. Compare up to three servers with evidence-backed fields and dates.
4. Read review details covering setup, capabilities, permissions, compatibility, and verification notes.
5. Submit a new listing or correction request.
6. Have the submission reviewed and published by editors only after verification.

## Trust model

- Public content must distinguish between publisher claims and verified review outcomes.
- Unknown and Not tested are valid states; they are not the same as fail or unsupported.
- No fabricated endorsements, pricing, compatibility results, or security conclusions.
- Synthetic demo fixtures must be visibly marked and excluded from product indexing.

## Launch scope

The initial public release aims for 20–30 verified listings/reviews. The team should prefer a smaller honest collection over a larger fabricated or unverified set.

## Functional boundaries

- Search and browse are public.
- Submissions and moderation are restricted to authenticated flows and editor review.
- Admin/editor functionality is not available by user-controlled metadata.
- No one-click package installation or arbitrary execution from submitted content.

## Non-goals for initial MVP

- Paid placements.
- Public user star ratings or open comments.
- Live external scraping of third-party packages or arbitrary code execution.
- Spam-prone email relays or bulk promotional messages.

## Phase plan

- Phase 0: specification, repo guidance, environment verification.
- Phase 1: shell and visual system.
- Phase 2: database, auth, and permission model.
- Phase 3: editorial dashboard and publishing.
- Phase 4: discovery, comparison, submissions, and email.
- Phase 5: launch readiness and production operations.
- Phase 6+: member ownership, verified developers, and future product extensions.

## Success criteria

The product is ready to continue only when the repository contains a durable brief, verified environment readiness, and explicit owner setup steps. The application shell and future phases must preserve the evidence-first and no-fabrication principles throughout.
