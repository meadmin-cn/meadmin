# AGENTS.md — Guidance for AI coding assistants working with Me-Admin

## What this project is

Me-Admin is a full-stack admin framework: Midway 3 + Koa + Sequelize 7 + PostgreSQL (backend, native ESM) and Vue 3 + Vite + Element Plus + vxeTable (frontend). It generates complete CRUD modules from a single Sequelize entity definition.

## Non-negotiable conventions

1. **CLI invocation**: always `pnpm exec meadmin <command>` (the `@meadmin/cli` package provides the `meadmin` bin; there is no root npm script named `meadmin`). Never write `pnpm meadmin ...`.
2. **Native ESM**: the repo is `"type": "module"` with `module: NodeNext`. Never convert imports to CommonJS `require`.
3. **CLI environment**: the CLI does not auto-load `.env.local`. For DB-touching commands use `-m local` (or the appropriate `-m <env>`).
4. **Credentials**: never modify `.env*` files, passwords, or database credentials. Never change DB schema/constraints on remote/online databases without explicit user authorization.
5. **pnpm versions**: lockfile is v9 format; pnpm 9/10/11/12 are all supported. Do not rewrite `pnpm-lock.yaml` manually.
6. **Generation is deterministic**: `crud` output is plain source code owned by the repo — editing generated files is normal and expected.

## Everyday commands

```bash
pnpm dev                                  # start full dev environment (front :7001, admin /admin)
pnpm exec meadmin sync <entity> -m local  # sync DB schema for an entity (comma-separated or * for all)
pnpm exec meadmin crud <entity> --menu -m local   # generate controller/service/frontend/menu for an entity
pnpm exec meadmin crud <entity> --menu -f -m local # regenerate (force overwrite)
pnpm exec meadmin addon <file>            # install a plugin
pnpm exec meadmin compress                # build deployment archive
pnpm exec meadmin update                  # upgrade framework from official template
```

## Typical workflow: adding a business module

1. Define a Sequelize entity in `src/entities/` (fields + comments; comments become form labels/validation hints).
2. `pnpm exec meadmin sync <entity> -m local`
3. `pnpm exec meadmin crud <entity> --menu -m local`
4. Refresh the admin panel — menu, routes, permissions are mounted automatically.
5. Implement real business logic inside the generated controller/service/views.

## Module layout (simplified)

- `src/entities/` — Sequelize entities (the single source of truth for a module's data shape)
- `src/app/admin/` — generated admin controllers/services
- `view/admin/src/views/` — generated admin frontend pages
- `view/index/` — public-facing site (SSR)

## Verification rules

- After changes, verify with both a file spot-check and a real API call before declaring done.
- Clean up any permanent test data created during debugging.
