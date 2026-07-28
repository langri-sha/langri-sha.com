# PR #1204 "Update swc monorepo" — diagnosis and upstream hand-off

**Status:** root cause confirmed. The durable fix belongs in
[`langri-sha/projen`](https://github.com/langri-sha/projen)
(`@langri-sha/projen-project`), not in this repository. No code change is made
here; see [Rollout](#rollout-in-this-repository).

## Summary

`@langri-sha/projen-project` hard-pins `@swc/core` and `@swc-node/register`
inside its `swcrc` feature, and it does so _after_ the consuming project's
`package.devDeps` have been applied. projen's `Dependencies` is
last-writer-wins, so the preset's pin silently overwrites whatever this
repository declares.

The result is a dependency upgrade that cannot land. Renovate bumps the
versions, the post-upgrade job runs `pnpm projen`, synthesis reverts them, a bot
commits the revert, and the PR merges as a no-op — so Renovate immediately
recreates the branch. That is the "immortal PR" behaviour observed on #1204.

This is **not** a peer-dependency conflict, a credentials or actor problem, a
branch-protection problem, or a Renovate misconfiguration.

## Lifecycle of #1204

| Time (UTC, 2026-07-28) | SHA        | Actor               | Event                                                                                        |
| ---------------------- | ---------- | ------------------- | -------------------------------------------------------------------------------------------- |
| 09:52:00               | `847a6e69` | `renovate[bot]`     | Bumps `package.json` + `pnpm-lock.yaml` to `@swc-node/register@1.12.1` / `@swc/core@1.15.46` |
| 09:53:22               | `7d9c26f8` | `mal-the-kron[bot]` | "chore(deps): Apply upgrade changes" — reverts both back to `1.11.1` / `1.15.40`             |
| ~16:05:55              | —          | Filip               | Rebase-merged onto `main`; net effect on the dependency is zero                              |
| 16:08:46               | `541860d8` | `renovate[bot]`     | Branch force-recreated with the identical bump                                               |
| 16:10:06               | `91e2686d` | `mal-the-kron[bot]` | Identical revert committed again                                                             |

`git log -S'"@swc-node/register": "1.11.1"' -- package.json` shows the same
bump/revert pair at least four times (`7fd3e121`, `efa15e6c`, `24a0e10b`,
`847a6e69`).

The decisive evidence is in run
[`30376847775`](https://github.com/langri-sha/langri-sha.com/actions/runs/30376847775),
job _Renovate Post-Upgrade_. `pnpm install` first brings in what Renovate asked
for, then `pnpm projen` re-synthesizes `package.json` and its `postSynthesize`
install walks the versions back down:

```
+ @swc-node/register 1.12.1          <- Renovate's lockfile
+ @swc/core 1.15.46
...
👾 Installing dependencies...
👾 install:ci | pnpm i --no-frozen-lockfile
- @swc-node/register 1.12.1
+ @swc-node/register 1.11.1 (1.12.1 is available)
- @swc/core 1.15.46
+ @swc/core 1.15.40 (1.15.46 is available)
```

## Root cause

`@langri-sha/projen-project@0.22.2`, `packages/projen-project/src/index.ts`
(shipped as `dist/index.js:448-449`):

```ts
#configureSWC({ swcrc, typeScriptConfig }: ProjectOptions) {
  if (!swcrc) {
    return
  }

  if (!this.parent) {
    this.package?.addDevDeps('@swc/core@1.15.40')
    this.package?.addDevDeps('@swc-node/register@1.11.1')
  }
  // ...
}
```

`#configurePackage` constructs the `NodePackage` — which registers the
consumer's `package.devDeps` into `project.deps` — and every `#configure*`
feature hook runs afterwards. `Dependencies.addDependency` replaces an existing
entry of the same name and type, so the preset's literal always wins.

`.projenrc.ts` in this repository has declared `@swc-node/register@1.12.1` /
`@swc/core@1.15.46` since `7fd3e121` (2026-07-25). Those two lines are dead
text: `pnpm projen` emits `1.11.1` / `1.15.40` regardless. `main` is internally
consistent — `package.json`, `.projen/deps.json` and the lockfile all agree with
the preset — which is why CI is green and the defect is invisible outside a
Renovate PR.

Reproduced locally on `main` (`7d9c26f8`): `.projenrc.ts` declares `1.12.1`,
`pnpm projen` writes `1.11.1` to both `package.json` and `.projen/deps.json`,
and the tree is clean afterwards.

### This is a class, not a one-off

The preset pins nine dependencies this way:

```
beachball@2.65.5   husky@9.1.7   projen@0.86.5   tsx@4.23.1   typescript@5.9.3
@swc/core@1.15.40  @swc-node/register@1.11.1
@langri-sha/projen-project@*   @langri-sha/tsconfig@*
```

`.projenrc.ts` here also declares `projen@0.86.5`, `tsx@4.23.1` and
`@langri-sha/projen-project@0.22.2`. Those declarations are equally inert; they
merely happen to agree with the preset today (or, for the `*` entries, to match
what `*` resolves to from `node_modules`). SWC is the only one where the values
diverged, which is why it is the one that surfaced. A Renovate bump of `tsx` or
`projen` in this repository would fail in exactly the same way.

## Required upstream fix (`langri-sha/projen`)

Feature-owned pins must not overwrite a declaration the consuming project made
explicitly. Add a guard and route the feature pins through it.

```ts
import { DependencyType } from 'projen'

/**
 * Add a dependency pin owned by a feature, unless the consuming project
 * already declared it.
 *
 * `#configure*` hooks run after `package.devDeps` have been registered, and
 * projen's `Dependencies` is last-writer-wins, so an unconditional
 * `addDevDeps` silently overwrites the version the project asked for — the
 * upgrade is then reverted by the next `pnpm projen`.
 */
#addManagedDevDeps(...specs: string[]) {
  for (const spec of specs) {
    const at = spec.lastIndexOf('@')
    const name = at > 0 ? spec.slice(0, at) : spec

    if (this.deps.tryGetDependency(name, DependencyType.BUILD)) {
      continue
    }

    this.package?.addDevDeps(spec)
  }
}
```

Then, in `#configureSWC`:

```ts
if (!this.parent) {
  this.#addManagedDevDeps('@swc/core@1.15.40', '@swc-node/register@1.11.1')
}
```

Apply the same treatment to the other feature pins: `beachball@2.65.5`,
`husky@9.1.7`, `projen@0.86.5`, `tsx@4.23.1`, `typescript@5.9.3`.

`tryGetDependency(name, type?)` and `DependencyType.BUILD` are both public in
projen `0.86.5` (`lib/dependencies.d.ts:62`, `:155`); devDeps are recorded as
`"type": "build"` in `.projen/deps.json`.

Two judgment calls for that repository:

- **The `*` pins** (`@langri-sha/projen-project@*`, `@langri-sha/tsconfig@*`)
  are deliberate — `*` resolves to the installed version. Letting a consumer's
  explicit pin win there is defensible but is a behaviour change; decide it
  separately from the literal pins.
- **Release type.** The change alters synthesized output for any consumer whose
  declaration currently loses, so a minor is more honest than a patch.

Suggested coverage in `packages/projen-project/src/index.test.ts`: a project
with `swcrc: {}` and `package.devDeps: ['@swc/core@<other>']` must synthesize
`<other>`.

## Rollout in this repository

No change is needed here. Once the fix is released:

1. Renovate opens the grouped **"Update langri-sha projen toolchain"** PR
   bumping `@langri-sha/projen-project`.
2. Merging it makes the _existing_ `.projenrc.ts` declaration live; the
   post-upgrade `pnpm projen` then emits `@swc-node/register@1.12.1` /
   `@swc/core@1.15.46` on its own.
3. #1204 becomes a genuine no-op and Renovate retires the branch.

Watch for one side effect at step 2: `@langri-sha/projen-project@0.22.2` in
`.projenrc.ts` also stops being inert and begins overriding the preset's `*`
self-pin. `projen@0.86.5` and `tsx@4.23.1` currently match the preset, so they
are no-ops.

Afterwards, consider dropping the redundant `projen`, `tsx` and
`@langri-sha/projen-project` entries from `.projenrc.ts` `devDeps` if the preset
is meant to own them.

## Rejected local workarounds

Both were implemented and validated in this worktree before being reverted in
favour of the upstream fix.

- **Re-assert after construction** — remove the two entries from
  `package.devDeps` and call `project.package?.addDevDeps(...)` after
  `new Project()`, where they win. Verified working: synthesis produced `1.12.1`
  / `1.15.46`, was idempotent on a second run, and Prettier, ESLint,
  `tsc --build`, Vitest, `sort-package-json` and `npm pkg fix` all passed.
  Rejected as a workaround that depends on synth ordering and does nothing for
  `tsx` / `projen`.
- **Concede ownership** — delete the entries and disable `@swc/core` /
  `@swc-node/register` in this repository's Renovate `packageRules`. Note that
  deleting the entries _alone_ does not stop the loop: Renovate's npm manager
  reads `package.json`, which the preset still populates, so the bump/revert
  cycle continues until Renovate is told to stop proposing it. Rejected because
  it freezes SWC at `1.15.40` indefinitely.

## Optional hardening (`langri-sha/github`, separate dispatch)

Not required, and explicitly out of scope for this investigation. The
`commit-upgrade-changes` job in
`langri-sha/github/.github/workflows/check.yml@v0.14.1` is behaving exactly as
designed — it faithfully commits a patch that `pnpm projen` legitimately
produced. But it commits it _silently_, which is what let this run four times
undetected.

A guard could compare the post-upgrade patch against the PR's own diff and fail
when the patch reverses a dependency version the PR introduced, turning a silent
no-op upgrade into a loud failure on the first run.

## Security review

Nothing in this diagnosis or its rollout weakens any existing control:

- No change to branch protection, repository secrets, or Renovate's hosted
  configuration.
- The privilege split in `check.yml` is intact and is not implicated.
  `post-upgrade` runs untrusted PR code with `permissions: contents: read` and
  `persist-credentials: false`; only a patch artifact crosses into
  `commit-upgrade-changes`, which holds the App token and re-checks that the
  patch touches no `.github/workflows/` or `.github/actions/` path.
- The `if:` guards restricting both jobs to same-repository pull requests
  authored by `renovate[bot]` / `dependabot[bot]` are unchanged, so fork PRs
  still cannot reach the App token.
- No token or secret value was read or printed during the investigation.

## Validation performed

Run in this worktree, on `main` (`7d9c26f8`):

- Reproduced the defect: `pnpm projen` overwrites the `.projenrc.ts` SWC
  declaration with the preset's pin, in both `package.json` and
  `.projen/deps.json`.
- Confirmed the pin is present in the installed
  `@langri-sha/projen-project@0.22.2` (`dist/index.js:448-449`) and in the
  current `src/index.ts` upstream.
- Confirmed the `Dependencies` API used by the proposed patch exists in the
  installed projen `0.86.5`.
- Confirmed the override is bidirectional by making the consumer declaration win
  and observing correct output (see
  [Rejected local workarounds](#rejected-local-workarounds)).
- The worktree was returned to a clean `main` state; `node_modules` was
  reinstalled from the restored lockfile.

The proposed upstream patch itself has **not** been executed or tested — it
targets a repository that is out of scope here.
