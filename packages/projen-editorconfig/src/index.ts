import { Component, IniFile, type Project } from 'projen'

/**
 * EditorConfig options.
 */
export interface EditorConfigOptions {
  [pattern: string]: {
    /**
     * Enforce either spaces or tabs for indentation.
     */
    indent_style?: 'tab' | 'space'

    /**
     * The number of spaces per indent level OR the string "tab" to use the editor's tab settings.
     */
    indent_size?: number | 'tab'

    /**
     * The number of spaces a tab represents (overrides the editor's setting if indent_style is 'tab').
     */
    tab_width?: number

    /**
     * Specifies the line ending format (LF, CRLF, or CR).
     */
    end_of_line?: 'lf' | 'crlf' | 'cr'

    /**
     * Specifies the encoding of the file.
     */
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    charset?: 'latin1' | 'utf-8' | 'utf-8-bom' | 'utf-16be' | 'utf-16le'

    /**
     * Trims any whitespace at the end of lines.
     * @default true
     */
    trim_trailing_whitespace?: boolean

    /**
     * Ensures a single newline at the end of the file.
     */
    insert_final_newline?: boolean
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
        ...options,
      },
    })
  }
}
