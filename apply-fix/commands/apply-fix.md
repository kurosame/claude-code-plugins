---
description: Apply fixes (from prior review findings or detected by checks) and iterate the project's check commands until all pass.
---

Follow these instructions strictly. This command works across language ecosystems (Node, Python, Go, etc.).

This command's job:
- Apply fixes to the codebase by editing existing files OR creating new files when a finding explicitly calls for a missing file. Source of fixes (in priority): findings already present in the conversation context (e.g. from a prior code-review run), or issues newly surfaced by check command failures.
- Run the project's check commands (lint, type-check, build, test, etc.).
- Iterate until all checks pass.

This command does NOT create branches, commit, or open a PR — it only edits / creates files and runs checks. Leave the resulting changes uncommitted.

## Workflow

1. Identify the work to do:
   - If a prior review's findings exist in the conversation, treat them as the initial set of fixes to apply.
   - Otherwise, run the check commands first (see step 3) and let any failures define the work.
2. Apply fixes by editing files directly, or by creating files when a finding explicitly identifies a missing file (type `create-new`) — only create files that the findings call for; do not invent new files on your own.
3. **MANDATORY**: Infer this project's check commands and execute ALL of them. Use this priority order:
   1. **Aggregate script** if one exists, e.g.:
      - Node: `npm run ci`, `npm run check`, `npm run verify`
      - Make: `make ci`, `make check`, `make verify`
      - Python: `tox`, `nox`
      - Other: any single command the project documents as "run all checks"
      Prefer this over running individual scripts.
   2. **Individual scripts** in the project's task definition file covering format, lint, type-check, build, and test (run them in that order). Sources to inspect, by language:
      - Node: `package.json` scripts. Use `pnpm` if `pnpm-lock.yaml` exists, `yarn` if `yarn.lock`, otherwise `npm`.
      - Python: prefer `pyproject.toml` (e.g. `ruff check`, `mypy`, `pytest`) and honor `uv` / `poetry` / `hatch` if configured. Fall back to `requirements.txt` / `requirements-dev.txt` projects (run `python -m pytest`, `python -m mypy`, etc. directly).
      - Go: `gofmt -l`, `go vet ./...`, `go build ./...`, `go test ./...`, `golangci-lint run` if present.
      - `Makefile` / `Justfile` targets that look like checks.
   3. **CI workflow files** under `.github/workflows/` (e.g. `check.yml`, `ci.yml`) as a last resort.
4. When extracting commands from CI workflow YAML files: ONLY use `run:` blocks containing locally reproducible shell commands. EXCLUDE all of:
   - `uses:` action steps (e.g. `actions/checkout`, `actions/setup-node`).
   - Steps that depend on `secrets.*` or `vars.*`.
   - `matrix` strategies (pick one representative configuration if needed).
   - Deployment, release, or environment-mutating steps.
5. **NEVER execute** commands in the following categories — they are long-running, server-starting, watch-mode, or otherwise unsafe:
   - Dev / preview / production servers
     - Node: `dev`, `start`, `serve`, `preview`
     - Python: `runserver`, `manage.py runserver`, `uvicorn`/`gunicorn` without an exit
     - Go: any `go run` command (cannot reliably distinguish a server entrypoint from a CLI; default to excluding)
   - Watch mode
     - Anything containing `--watch` or `watch:*`
     - Test runners that default to watch (`vitest` without `run`/`--run`, `jest` without `--ci`). When invoking `vitest`/`jest` directly, force one-shot mode (`vitest run`, `jest --ci`, or set `CI=true`)
   - Long-running UI: e.g. `storybook`
   - Bundle analyzers that may open a browser: e.g. `analyze`
   - Publish / release scripts: `npm publish`, `goreleaser`, `release-it`, etc.
   - Deploy / infrastructure-mutating commands: `terraform apply`, `kubectl apply`, `docker push`, `pulumi up`, etc.
   - Database migrations or seeds against real databases: `migrate`, `db:migrate`, `db:seed`, `alembic upgrade`, etc.
   - `postinstall` / `prepare` scripts that have already run during install
6. Before executing, list the commands you decided to run and the inference source (which file / which entry) so the choice is auditable.
7. If ANY command fails:
   - Fix the issues in the code.
   - Re-run ALL checks from the beginning.
   - Repeat this cycle until ALL commands pass, but stop after **3 unsuccessful iterations** of the same failing command and report the situation in the conversation instead of looping forever.
8. When ALL checks pass, summarize the commands executed and the resulting working tree state. Leave all changes uncommitted.

## Policies

- Do NOT create branches, commit, or open a PR.
- Do NOT push to any remote.
- Do NOT modify formatter / linter configuration files to silence errors; fix the underlying code.
