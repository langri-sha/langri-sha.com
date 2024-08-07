# @langri-sha/projen-project

Collection of [projen] templates for bootstraping monorepos and workspace
projects.

## Features

- managing [Beacbhall] configuration for publishing packages
- configures [PNPM] [workspaces]
- configures [`@langri-sha/tsconfig`] for TypeScript monorepos
- managing Git hooks with [`@langri-sha/projen-husky`]
- configures extensive list of Git ignore patterns
- manages [code owners] with [`@langri-sha/projen-codeowners`]

[`@langri-sha/codeowners`]: https://www.npmjs.com/package/@langri-sha/codeowners
[`@langri-sha/projen-husky`]:
  https://www.npmjs.com/package/@langri-sha/projen-husky
[`@langri-sha/tsconfig`]: https://www.npmjs.com/package/@langri-sha/tsconfig
[beachball]: https://microsoft.github.io/beachball/
[code owners]:
  https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[pnpm]: https://pnpm.io
[projen]: https://projen.io/
[workspaces]: https://pnpm.io/workspaces
