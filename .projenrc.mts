import { Project } from '@langri-sha/projen-project'

const project = new Project({
  name: "langri-sha.com",
  beachballConfig: {},
  editorConfigOptions: {},
  withTypeScript: true,
  withTerraform: true,
  workspaces: [
    'apps/*',
    'packages/*'
  ]
});

project.synth();
