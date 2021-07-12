// flow-typed signature: 0b1282d6fb5830f0be4350c87bfc228f
// flow-typed version: c6154227d1/webfontloader_v1.x.x/flow_>=v0.104.x

declare module "webfontloader" {
  declare type WebFontConfig = {
    loading?: () => mixed,
    active?: () => mixed,
    inactive?: () => mixed,
    fontloading?: (familyName: string, fvd: string) => mixed,
    fontactive?: (familyName: string, fvd: string) => mixed,
    fontinactive?: (familyName: string, fvd: string) => mixed,
    classes?: boolean,
    events?: boolean,
    timeouts?: number,
    custom?: {
      families: string[],
      urls?: string[],
      testStrings?: { [k: string]: string, ... },
      ...
    },
    fontdeck?: { id: string, ... },
    monotype?: {
      projectId: string,
      version?: number,
      ...
    },
    google?: {
      families: string[],
      text?: string,
      ...
    },
    typekit?: { id: string, ... },
    ...
  };
  declare class WebFont {
    load(config: WebFontConfig): void;
  }

  declare module.exports: WebFont;
}
