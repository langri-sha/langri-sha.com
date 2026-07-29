# Renovate PR #1173: Vitest v4 upgrade review

Reviewed 2026-07-29 against the PR diff, resolved lockfile, repository usage,
and upstream migration guides.

## Exact upgrade set

The Renovate declaration changes one direct development dependency:

| Package  | Before |  After | Scope                                                                             |
| -------- | -----: | -----: | --------------------------------------------------------------------------------- |
| `vitest` |  2.1.9 | 4.1.10 | Declared in `.projenrc.ts`; generated into `.projen/deps.json` and `package.json` |

It crosses both Vitest v3 and v4. The lockfile also resolves a separate,
transitive major-line change:

| Package  | Before |                           After | Why                                                   |
| -------- | -----: | ------------------------------: | ----------------------------------------------------- |
| `vite`   | 5.4.21 |                           8.1.5 | Vitest 4 requires Vite 6+ and permits Vite 6, 7, or 8 |
| `rollup` | 4.62.3 | removed; `rolldown` 1.1.5 added | Vite 8's bundler transition                           |

So the visible title is complete for declared dependencies, but incomplete as a
toolchain-impact summary: this is one declared Vitest update and one transitive
Vite update. Vite itself crosses v6, v7, and v8; it is not a second Renovate
declaration.

The unchanged `@langri-sha/vitest@0.1.8` wrapper peers on `vitest: ^4.0.0` and
only re-exports Vitest, Nock, and Tempy. The base lockfile resolved that peer
against Vitest 2; this PR now resolves it against the supported Vitest 4 line.

## Release-note findings and repository fit

- [Vitest 3 migration](https://v3.vitest.dev/guide/migration) removes support
  for object-valued third test arguments in v4 and changes some mock, fake
  timer, coverage, and direct API behaviour. The repository uses none of those
  APIs.
- [Vitest 4 migration](https://vitest.dev/guide/migration) requires Node 20+ and
  Vite 6+, changes V8 coverage, removes `coverage.all` and
  `coverage.extensions`, narrows default exclusions, and changes browser,
  mocking, workspace, and advanced module-runner behaviour. The repository has
  no Vitest configuration, coverage, browser mode, custom runner, workspace,
  mock, or `vi` usage. Its Node floor is `>=24.16.0`, satisfying Vitest 4 and
  the locked Vite 8 requirement (`^20.19.0 || >=22.12.0`).
- [Vite 8 migration](https://vite.dev/guide/migration) moves to Rolldown/Oxc
  while converting many existing esbuild and Rollup options automatically. This
  repository has no Vite config, plugins, or direct Vite API usage; Vitest is
  the only Vite consumer. No Vite migration change is required.

The only local test usage is four intentionally skipped tests in two source
files. They import `expect` and `test` from `@langri-sha/vitest`; there are no
direct Vitest subpath imports or migration-sensitive options.

## Changes made

### Required compatibility changes

None. The Renovate lockfile update satisfies Vitest 4's Vite and Node
requirements, and the usage audit found no affected API or configuration.

### Low-risk validation improvement

Updated the root `test` script, through `.projenrc.ts`, from a filter targeting
`@langri-sha/web` (which has no `test` script and therefore exited without
running tests) to `pnpm exec vitest --passWithNoTests`. This makes the canonical
local command exercise the upgraded runner and matches the PR's successful CI
Vitest invocation. `package.json` is regenerated from Projen.

## Validation

- `pnpm install --frozen-lockfile` passed on Node v25.2.1 and pnpm v11.17.0; the
  lockfile also passed the repository supply-chain policy check.
- `pnpm exec tsx .projenrc.ts` passed and regenerated managed files without
  drift.
- `pnpm exec vitest run` passed with Vitest 4.1.10: 2 test files and 4 tests
  were discovered, all explicitly skipped.
- `pnpm test` passed after the script correction and ran the same Vitest 4.1.10
  discovery: 2 test files and 4 explicitly skipped tests.
- The original PR head `d1cb4dab` passed GitHub Actions Lint, Vitest, Build, and
  Deploy. New CI is required for the review commit.

## Intentionally deferred

- Do not add coverage configuration: there is no existing coverage workflow, and
  Vitest 4's coverage changes only matter when coverage is enabled.
- Do not add Browser Mode, custom reporters, new assertions, or Vite config:
  none has a repository need.
- Do not unskip the existing tests as part of this dependency PR. They need
  their own behavioural-test investigation; their skipped status means this
  upgrade validates discovery and loading, not test assertions.
