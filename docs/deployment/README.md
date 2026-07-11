# Deployment

> Status: nothing deployed yet — `apps/web` (the shareable-link viewer) is the only piece that needs hosting. This documents the planned setup.

## Environments

| Environment | URL | Deploy trigger |
|---|---|---|
| dev | local only (`pnpm dev`) | manual |
| prod | TBD (Vercel project, not yet created) | push to `main` |

## Required permissions

- Vercel project access — needed to deploy `apps/web`
- Object storage (e.g. S3/R2) write access — needed for `apps/web` to store
  uploaded recordings behind shareable links

## Pipeline stages

1. Lint + typecheck — gates the merge
2. Unit + integration tests (Vitest) — gates the merge
3. Build `apps/web` — gates the deploy
4. Deploy to Vercel on merge to `main`

## Environment variables / secrets

| Name | Where set | Purpose |
|---|---|---|
| `STORAGE_BUCKET` | Vercel project env | where uploaded recordings are stored |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | Vercel project env (secret) | object storage credentials for `apps/web` |

## Rollback

Revert the merge commit on `main`; Vercel redeploys the previous build
automatically. Stored recordings are versioned by ID, so a rollback doesn't
affect already-shared links.
