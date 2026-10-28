# Owner setup

## Required before Phase 1

1. Confirm this repository is the intended project and that it is not an accidental duplicate.
2. Ensure Git is available and the repo is connected to the expected GitHub remote.
3. Ensure Node.js LTS is installed and working.
4. Ensure pnpm is available. If it is not installed, enable it via Corepack with:
   - `corepack enable`
   - `corepack prepare pnpm@latest --activate`
5. Verify the package registry is reachable.
6. Keep credential and secret values in private environment files and provider secret stores rather than in chat or source control.

## Owner actions outside VS Code

The following are not required for Prompt 0 itself, but they are the next practical steps before Phase 1 begins:

- If the repo is not the intended `mcplist` project, switch to the correct repository before continuing.
- If pnpm is still missing after Corepack activation, install it using the official instructions for your OS and verify `pnpm --version` before continuing.

## Verification checklist

Run these checks before starting Phase 1:

```bash
git --version
node --version
npm --version
pnpm --version
npm ping --registry=https://registry.npmjs.org
```

Expected result: all commands succeed, and npm can reach the registry.
