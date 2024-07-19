import {
  GitAttributesFile as BaseGitAttributesFile,
  type IResolver,
} from 'projen'

export class GitAttributesFile extends BaseGitAttributesFile {
  protected override synthesizeContent(
    resolver: IResolver,
  ): string | undefined {
    const content = super.synthesizeContent(resolver)?.split('\n')

    return content?.join('\n')
  }
}
