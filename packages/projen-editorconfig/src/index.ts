import { Component, IniFile, type Project } from 'projen'

/**
 * EditorConfig options.
 */
export interface EditorConfigOptions {
  readonly [pattern: string]: {
    /**
     * Enforce either spaces or tabs for indentation.
     */
    readonly indent_style?: 'tab' | 'space'

    /**
     * The number of spaces per indent level OR the string "tab" to use the editor's tab settings.
     */
    readonly indent_size?: number | 'tab'

    /**
     * The number of spaces a tab represents (overrides the editor's setting if indent_style is 'tab').
     */
    readonly tab_width?: number

    /**
     * Specifies the line ending format (LF, CRLF, or CR).
     */
    readonly end_of_line?: 'lf' | 'crlf' | 'cr'

    /**
     * Specifies the encoding of the file.
     */

    readonly charset?:
      | 'latin1'
      | 'utf-8'
      | 'utf-8-bom'
      | 'utf-16be'
      | 'utf-16le'

    /**
     * Trims any whitespace at the end of lines.
     * @default true
     */
    readonly trim_trailing_whitespace?: boolean

    /**
     * Ensures a single newline at the end of the file.
     */
    readonly insert_final_newline?: boolean
  }
}

/**
 * A component for authoring EditorConfig configurations.
 */
export class EditorConfig extends Component {
  constructor(project: Project, options?: EditorConfigOptions) {
    super(project)

    new IniFile(project, '.editorconfig', {
      obj: {
        ...(this.project?.parent === undefined ? { root: true } : {}),
        ...options,
      },
    })
  }
}
