/// <reference types="@types/gtag.js" />

declare type WebEnv = {
  NODE_ENV: 'development' | 'production'
  /** Add experimental scene to landing page, when set. */
  EXPERIMENTAL_SCENE: string | null
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends WebEnv {}
  }
}

declare module 'webfontloader'

declare module '*.css' {
  const content: string

  export default content
}

declare module '*.frag' {
  const content: string

  export default content
}

declare module '*.vert' {
  const content: string

  export default content
}
