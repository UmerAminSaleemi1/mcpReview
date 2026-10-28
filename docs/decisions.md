# Routine decisions and repository choices

## Decision summary

- Repository path: `C:/mcpReviewer`
- Git remote: `https://github.com/UmerAminSaleemi1/mcpReview.git`
- Default package manager: `pnpm`, activated through Corepack.
- Default runtime: Node.js LTS; current environment is Node v24.18.0.
- Project name: `mcplist` with domain `mcplist.com`.
- Product direction: evidence-first MCP directory and review platform.
- Content stance: public browsing without login; editorial review gating for publication.

## Operational decisions

- Use the repository as the single source of truth for project work.
- Keep the build specification in `docs/build-playbook.md` and preserve the owner setup instructions in `docs/owner-setup.md`.
- Apply Prompt 0 only; do not scaffold the app yet.
- Use the real project repository and not a parallel or nested app folder.
- Keep optional integrations for later phases out of this setup step.

## Verification done

- `git --version` succeeded.
- `node --version` succeeded.
- `npm --version` succeeded.
- `npm ping --registry=https://registry.npmjs.org` succeeded.
- `pnpm --version` initially failed because pnpm was not installed; Corepack then activated pnpm successfully.
- `git status --short --branch` confirmed the repo is on `main` and connected to the GitHub remote.

## Outstanding or blocked items

- No application scaffolding yet.
- No production credentials or secrets are present or required for this phase.
- Docker and Supabase are not required until Phase 2.
- Browser tools and Playwright are not yet relevant before app scaffolding and will be validated later in the correct phase.
