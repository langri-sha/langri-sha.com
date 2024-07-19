import {
  GitAttributesFile as BaseGitAttributesFile,
  type IResolver,
} from 'projen'

export class GitAttributesFile extends BaseGitAttributesFile {
  protected override synthesizeContent(
    resolver: IResolver,
  ): string | undefined {
    const content = super.synthesizeContent(resolver)?.split('\n')

    if (!content) {
      return
    }

    const [marker, blank, ...rest] = content
    rest.sort((a, b) => a.localeCompare(b))

    return [marker, blank, ...rest, ''].join('\n')
  }
}
