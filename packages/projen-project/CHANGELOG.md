# Change Log - @langri-sha/projen-project

This log was last generated on Tue, 30 Jul 2024 01:07:42 GMT and should not be manually modified.

<!-- Start content -->

## 0.15.0

Tue, 30 Jul 2024 01:07:42 GMT

### Minor changes

- feat(project): Lint synthesized with ESLint and Prettier when configured (filip.dupanovic@gmail.com)

### Patches

- chore(deps): chore(deps): update dependency husky to v9.1.4 (email not defined)
- chore(deps): chore(deps): update dependency @swc/core to v1.7.3 (email not defined)

## 0.14.0

Sat, 27 Jul 2024 14:06:08 GMT

### Minor changes

- feat(project): Reconfigure ESLint filename for ESM packages (filip.dupanovic@gmail.com)

### Patches

- fix(project): Resolve missing `license-o-matic` declarations (filip.dupanovic@gmail.com)

## 0.13.0

Fri, 26 Jul 2024 21:00:28 GMT

### Minor changes

- feat(project): Add `ReadmeFile` support (filip.dupanovic@gmail.com)
- feat(workspace): Harden Projen component types (filip.dupanovic@gmail.com)
- feat(project): Annotate generated files on root project (filip.dupanovic@gmail.com)
- feat(projectj): Add custom `GitAttributesFile` (filip.dupanovic@gmail.com)

### Patches

- chore(deps): chore(deps): update dependency @swc/core to v1.7.0 (email not defined)
- chore(deps): chore(deps): update dependency projen to v0.84.7 (email not defined)
- chore(deps): chore(deps): update dependency husky to v9.1.0 (email not defined)
- chore(deps): chore(deps): update dependency @swc/core to v1.7.1 (email not defined)
- chore(deps): chore(deps): update dependency typescript to v5.5.4 (email not defined)
- chore(deps): chore(deps): update dependency @swc/core to v1.7.2 (email not defined)
- chore(deps): chore(deps): update dependency husky to v9.1.2 (email not defined)
- chore(deps): chore(deps): update dependency husky to v9.1.3 (email not defined)
- chore(deps): chore(deps): update dependency projen to v0.84.6 (email not defined)

## 0.12.0

Wed, 17 Jul 2024 10:48:16 GMT

### Minor changes

- feat(beachball): Add support for configuring filename (filip.dupanovic@gmail.com)
- feat(project): Change default Projen config filename (filip.dupanovic@gmail.com)
- feat(project): Reconfigure Lint Staged filename for ESM packages (filip.dupanovic@gmail.com)
- feat(project): Reconfigure Prettier filename for ESM packages (filip.dupanovic@gmail.com)
- feat(babel): Migrate to ESM configuration (filip.dupanovic@gmail.com)

### Patches

- chore(deps): chore(deps): update dependency @swc-node/register to v1.10.9 (email not defined)
- chore(deps): chore(deps): update dependency @swc-node/register to v1.10.7 (email not defined)
- fix(project): Apply ESLint ignore patterns to subdirectories (filip.dupanovic@gmail.com)
- fix(workspace): Use correct GitHub directory (filip.dupanovic@gmail.com)
- fix(project): Correctly name Babel configuration for ESM packages (filip.dupanovic@gmail.com)
- chore(deps): chore(deps): update dependency @swc-node/register to v1.10.8 (email not defined)
- fix(project): Use actual Beachball filename (filip.dupanovic@gmail.com)

## 0.11.0

Mon, 08 Jul 2024 21:43:05 GMT

### Minor changes

- feat(project): Add SWC support (filip.dupanovic@gmail.com)
- feat(project): Add peer dependencies (filip.dupanovic@gmail.com)
- feat(project): Add SWC dependencies (filip.dupanovic@gmail.com)
- feat(workspace): Use `vitest` (filip.dupanovic@gmail.com)

### Patches

- fix(projen): Use correct output directory (filip.dupanovic@gmail.com)
- chore(deps): chore(deps): update dependency typescript to v5.5.3 (email not defined)
- chore(deps): chore(deps): update dependency @types/ramda to v0.30.1 (email not defined)
- chore(deps): chore(deps): update dependency typescript to v5.5.2 (email not defined)

## 0.10.0

Sat, 15 Jun 2024 09:09:05 GMT

### Minor changes

- feat(project): Add support for finding all subprojects (filip.dupanovic@gmail.com)
- feat(projen): Simplify options (filip.dupanovic@gmail.com)
- feat(project): Add subproject callback (filip.dupanovic@gmail.com)
- feat(projen): Drop pinning peer dependencies (filip.dupanovic@gmail.com)
- feat(lint-synthesized): Run on all projects (filip.dupanovic@gmail.com)
- feat(project): Simplify project subfiltering (filip.dupanovic@gmail.com)
- feat(project): Add config files to TS" (filip.dupanovic@gmail.com)
- feat(project): Add task for debugging Renovate (filip.dupanovic@gmail.com)
- feat(project): Support assigning package `module` (filip.dupanovic@gmail.com)
- feat(projen): Reconfigure project expressions (filip.dupanovic@gmail.com)
- feat(project): Add support for `lint-staged` (filip.dupanovic@gmail.com)
- feat(project): Add `peerDependenciesMeta` field (filip.dupanovic@gmail.com)
- feat(projen): Reset `install:ci` task (filip.dupanovic@gmail.com)
- feat(project): Automatically configure project references (filip.dupanovic@gmail.com)
- feat(project): Add support for Prettier (filip.dupanovic@gmail.com)
- feat(project): Reconfigure PNPM workspace support (filip.dupanovic@gmail.com)
- feat(project): Add support for configuring ESLint (filip.dupanovic@gmail.com)
- feat(project): Manage package with projen (filip.dupanovic@gmail.com)
- feat(project): Enable Renovate lockfile maintenance (filip.dupanovic@gmail.com)
- feat(project): Reconfigure NPM ignore patterns (filip.dupanovic@gmail.com)
- feat(project): Add support for configuring Babel (filip.dupanovic@gmail.com)
- feat(project): Omit Node.js engine package defaults (filip.dupanovic@gmail.com)
- feat(project): Skip package install on subprojects (filip.dupanovic@gmail.com)
- feat(project): Ignore `dist/` with Git (filip.dupanovic@gmail.com)
- feat(project): Add projen config to TS files (filip.dupanovic@gmail.com)
- feat(project): Improve merging of default options (filip.dupanovic@gmail.com)
- feat(tsconfig): Manage package with projen (filip.dupanovic@gmail.com)
- feat(project): Update Node.js version with Renovate (filip.dupanovic@gmail.com)

### Patches

- fix(project): Ensure package always has version set (filip.dupanovic@gmail.com)
- chore(deps): chore(deps): update dependency projen to v0.82.4 (email not defined)
- fix(project): Match scoped packages with Renovate (filip.dupanovic@gmail.com)
- chore(deps): chore(deps): update dependency projen to v0.82.3 (email not defined)
- chore(deps): fix(deps): update dependency ramda to v0.30.1 (email not defined)
- fix(project): Preserve package versions (filip.dupanovic@gmail.com)
- fix(project): Do not ignore config with ELint (filip.dupanovic@gmail.com)

## 0.9.0

Sat, 25 May 2024 03:25:31 GMT

### Minor changes

- feat(projen): Add support for creating licenses (filip.dupanovic@gmail.com)
- feat(project): Add support for configuring Jest (filip.dupanovic@gmail.com)
- feat(project): Match project dependencies with Renovate (filip.dupanovic@gmail.com)
- feat(project): Add projenrc file to subprojects (filip.dupanovic@gmail.com)
- feat(project): Add support for NPM ignore files (filip.dupanovic@gmail.com)

### Patches

- fix(project): Update documentation URL (filip.dupanovic@gmail.com)
- fix(project): Update matching Renovate dependencies (filip.dupanovic@gmail.com)

## 0.8.1

Tue, 21 May 2024 07:47:40 GMT

### Patches

- fix(project): Remove default tasks for subprojects (filip.dupanovic@gmail.com)

## 0.8.0

Tue, 21 May 2024 05:22:50 GMT

### Minor changes

- feat(projen): Add component for Beacbhall support (filip.dupanovic@gmail.com)
- feat(project): Add stub projen configuration file (filip.dupanovic@gmail.com)
- feat(project): Upgrade PNPM with Renovate (filip.dupanovic@gmail.com)
- feat(project): Add support for Node.js packages (filip.dupanovic@gmail.com)
- feat(project): Match deps in modules with Renovate (filip.dupanovic@gmail.com)
- feat(project): Add support for subprojects (filip.dupanovic@gmail.com)

### Patches

- chore(deps): chore(deps): update dependency projen to v0.81.13 (email not defined)
- chore(deps): chore(deps): update dependency projen to v0.81.15 (email not defined)
- fix(project): Transpile sources only for default task (filip.dupanovic@gmail.com)
- fix(project): Correct Renovate dependency matching (filip.dupanovic@gmail.com)
- fix(projen-project): Lint only package modules (filip.dupanovic@gmail.com)
- fix(project): Add looser dependency matching (filip.dupanovic@gmail.com)

## 0.7.0

Wed, 15 May 2024 06:47:18 GMT

### Minor changes

- feat(projen-project): Add support for configuring TypeScript" (filip.dupanovic@gmail.com)

### Patches

- chore(deps): chore(deps): update dependency projen to v0.81.11 (email not defined)

## 0.6.1

Tue, 14 May 2024 20:41:06 GMT

### Patches

- chore(deps): fix(deps): update dependency ramda to v0.30.0 (email not defined)
- chore(deps): chore(deps): update dependency projen to v0.81.10 (email not defined)

## 0.6.0

Thu, 09 May 2024 07:29:56 GMT

### Minor changes

- feat(eslint): Upgrade to v9 (filip.dupanovic@gmail.com)
- feat(project): Add support for configuring Husky (filip.dupanovic@gmail.com)

## 0.5.0

Mon, 06 May 2024 02:33:10 GMT

### Minor changes

- feat(project): Add support for configuring code owners (filip.dupanovic@gmail.com)
- feat(projen-project): Manage Renovate configuration (filip.dupanovic@gmail.com)

## 0.4.1

Fri, 03 May 2024 12:54:50 GMT

### Patches

- fix(workspace): Correct published paths (filip.dupanovic@gmail.com)

## 0.4.0

Fri, 03 May 2024 10:44:32 GMT

### Minor changes

- feat(project): Configure package build (filip.dupanovic@gmail.com)
- feat(project): Add workspace output ignore patterns (filip.dupanovic@gmail.com)

### Patches

- fix(workspace): Revise build command (filip.dupanovic@gmail.com)

## 0.3.0

Wed, 01 May 2024 23:11:18 GMT

### Minor changes

- feat(project): Add EditorConfig support (filip.dupanovic@gmail.com)

## 0.2.0

Tue, 30 Apr 2024 23:02:33 GMT

### Minor changes

- feat(projen): Add support for configuring Beachball (filip.dupanovic@gmail.com)
- feat(projen): Remove top-level tasks (filip.dupanovic@gmail.com)
- feat(projen): Configure PNPM workspaces (filip.dupanovic@gmail.com)
- feat(projen-project): Configure ESM support (filip.dupanovic@gmail.com)
- feat(projen-projent): Configure linters for synthesized files (filip.dupanovic@gmail.com)
- feat(projen-project): Replace `deepMerge` (filip.dupanovic@gmail.com)
- feat(projen-project): Stub package (filip.dupanovic@gmail.com)
- feat(projen-project): Configure default task (filip.dupanovic@gmail.com)

### Patches

- fix(projen-project): Unignore projen config files (filip.dupanovic@gmail.com)
