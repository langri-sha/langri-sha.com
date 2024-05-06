import { Project } from '@langri-sha/projen-project'

const project = new Project({
  name: "langri-sha.com",
  beachballConfig: {},
  codeownersOptions: {
    '*': '@langri-sha'
  },
  editorConfigOptions: {},
  renovateOptions: {},
  withTerraform: true,
  withTypeScript: true,
  workspaces: [
    'apps/*',
    'packages/*'
  ]
});

project.synth();
