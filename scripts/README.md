# Repository maintenance scripts

These tools maintain the public source presentation. Run them from the repository root.

## Publication check

```bash
pnpm check:release
```

`check-release.mjs` inspects tracked files and untracked, non-ignored publication candidates. It rejects operational directories, environment files other than `.env.example`, key/backup/log files, large files, obsolete branding, and recognizable credential patterns. When private local environment files exist, it also checks that their secret values are absent from publication candidates. It reports file paths, never secret values.

This check is also run in CI. Review staged changes before committing and keep secrets in ignored runtime configuration.

## SVG generation

```bash
python3 scripts/generate-diagrams.py
```

The generator uses only Python's standard library and writes the six original diagrams under `docs/assets/`. Layout, colors, labels, arrows, and accessible SVG descriptions are maintained in that script. Commit generated diagrams alongside any architecture/documentation changes.

## Interface capture

Install root dependencies, build the web client, and start the standalone server in a separate terminal:

```bash
pnpm install --frozen-lockfile
NEXT_PUBLIC_API_URL=http://127.0.0.1:3100 pnpm --dir apps/web build
PORT=3100 HOSTNAME=127.0.0.1 pnpm --dir apps/web start:prod
```

Install a Playwright browser and capture:

```bash
pnpm exec playwright install chromium
pnpm preview:capture
```

To use an existing Chromium/Chrome installation, set `BROWSER_EXECUTABLE_PATH` to its executable. Set `PREVIEW_ORIGIN` if the local server uses another origin.

The script blocks external requests and injects fictional leaderboard responses only in the capture browser. A visible sample-data marker distinguishes the screenshots from a live server. It writes `preview-desktop.png` and `preview-mobile.png`; it does not seed a database or alter application API behavior.
