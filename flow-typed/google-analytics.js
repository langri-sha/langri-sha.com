// Type definitions for Google Analytics (Classic and Universal)
// Project: https://developers.google.com/analytics/devguides/collection/gajs/, https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference
// Definitions by: Ronnie Haakon Hegelund <http://ronniehegelund.blogspot.dk>, Pat Kujawa <http://patkujawa.com>, Tyler Murphy <https://github.com/tyler-murphy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare class Tracker {
  _trackPageview(): void;
  _getName(): string;
  _getAccount(): string;
  _getVersion(): string;
  _getVisitorCustomVar(index: number): string;
  _setAccount(): string;
  _setCustomVar(
    index: number,
    name: string,
    value: string,
    opt_scope?: number
  ): boolean;
  _setSampleRate(newRate: string): void;
  _setSessionCookieTimeout(cookieTimeoutMillis: number): void;
  _setSiteSpeedSampleRate(sampleRate: number): void;
  _setVisitorCookieTimeout(milliseconds: number): void;
  _trackPageLoadTime(): void;
}

interface GoogleAnalyticsCode {
  push(commandArray: Array<string | boolean | number>): void;
  push(func: Function): void;
}

interface GoogleAnalyticsTracker {
  _getTracker(account: string): Tracker;
  _createTracker(opt_account: string, opt_name?: string): Tracker;
  _getTrackerByName(opt_name?: string): Tracker;
  _anonymizeIp(): void;
}

interface GoogleAnalytics {
  type: string;
  src: string;
  async: boolean;
}

// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#hitType
type HitType =
  | 'pageview'
  | 'screenview'
  | 'event'
  | 'transaction'
  | 'item'
  | 'social'
  | 'exception'
  | 'timing'

// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
interface FieldsObject {
  affiliation?: string | void;
  allowAnchor?: boolean | void;
  allowLinker?: boolean | void;
  alwaysSendReferrer?: boolean | void;
  anonymizeIp?: boolean | void;
  appId?: string | void;
  appInstallerId?: string | void;
  appName?: string | void;
  appVersion?: string | void;
  brand?: string | void;
  campaignId?: string | void;
  campaignContent?: string | void;
  campaignKeyword?: string | void;
  campaignMedium?: string | void;
  campaignName?: string | void;
  campaignSource?: string | void;
  category?: string | void;
  clientId?: string | void;
  contentGroup1?: string | void;
  contentGroup2?: string | void;
  contentGroup3?: string | void;
  contentGroup4?: string | void;
  contentGroup5?: string | void;
  contentGroup6?: string | void;
  contentGroup7?: string | void;
  contentGroup8?: string | void;
  contentGroup9?: string | void;
  contentGroup10?: string | void;
  cookieName?: string | void;
  cookieDomain?: string | void;
  cookieExpires?: number | void;
  cookieFlags?: string | void;
  cookiePath?: string | void;
  cookieUpdate?: boolean | void;
  coupon?: string | void;
  creative?: string | void;
  currencyCode?: string | void;
  dataSource?: string | void;
  dimension1?: string | void;
  dimension2?: string | void;
  dimension3?: string | void;
  dimension4?: string | void;
  dimension5?: string | void;
  dimension6?: string | void;
  dimension7?: string | void;
  dimension8?: string | void;
  dimension9?: string | void;
  dimension10?: string | void;
  dimension11?: string | void;
  dimension12?: string | void;
  dimension13?: string | void;
  dimension14?: string | void;
  dimension15?: string | void;
  dimension16?: string | void;
  dimension17?: string | void;
  dimension18?: string | void;
  dimension19?: string | void;
  dimension20?: string | void;
  dimension21?: string | void;
  dimension22?: string | void;
  dimension23?: string | void;
  dimension24?: string | void;
  dimension25?: string | void;
  dimension26?: string | void;
  dimension27?: string | void;
  dimension28?: string | void;
  dimension29?: string | void;
  dimension30?: string | void;
  dimension31?: string | void;
  dimension32?: string | void;
  dimension33?: string | void;
  dimension34?: string | void;
  dimension35?: string | void;
  dimension36?: string | void;
  dimension37?: string | void;
  dimension38?: string | void;
  dimension39?: string | void;
  dimension40?: string | void;
  dimension41?: string | void;
  dimension42?: string | void;
  dimension43?: string | void;
  dimension44?: string | void;
  dimension45?: string | void;
  dimension46?: string | void;
  dimension47?: string | void;
  dimension48?: string | void;
  dimension49?: string | void;
  dimension50?: string | void;
  dimension51?: string | void;
  dimension52?: string | void;
  dimension53?: string | void;
  dimension54?: string | void;
  dimension55?: string | void;
  dimension56?: string | void;
  dimension57?: string | void;
  dimension58?: string | void;
  dimension59?: string | void;
  dimension60?: string | void;
  dimension61?: string | void;
  dimension62?: string | void;
  dimension63?: string | void;
  dimension64?: string | void;
  dimension65?: string | void;
  dimension66?: string | void;
  dimension67?: string | void;
  dimension68?: string | void;
  dimension69?: string | void;
  dimension70?: string | void;
  dimension71?: string | void;
  dimension72?: string | void;
  dimension73?: string | void;
  dimension74?: string | void;
  dimension75?: string | void;
  dimension76?: string | void;
  dimension77?: string | void;
  dimension78?: string | void;
  dimension79?: string | void;
  dimension80?: string | void;
  dimension81?: string | void;
  dimension82?: string | void;
  dimension83?: string | void;
  dimension84?: string | void;
  dimension85?: string | void;
  dimension86?: string | void;
  dimension87?: string | void;
  dimension88?: string | void;
  dimension89?: string | void;
  dimension90?: string | void;
  dimension91?: string | void;
  dimension92?: string | void;
  dimension93?: string | void;
  dimension94?: string | void;
  dimension95?: string | void;
  dimension96?: string | void;
  dimension97?: string | void;
  dimension98?: string | void;
  dimension99?: string | void;
  dimension100?: string | void;
  dimension101?: string | void;
  dimension102?: string | void;
  dimension103?: string | void;
  dimension104?: string | void;
  dimension105?: string | void;
  dimension106?: string | void;
  dimension107?: string | void;
  dimension108?: string | void;
  dimension109?: string | void;
  dimension110?: string | void;
  dimension111?: string | void;
  dimension112?: string | void;
  dimension113?: string | void;
  dimension114?: string | void;
  dimension115?: string | void;
  dimension116?: string | void;
  dimension117?: string | void;
  dimension118?: string | void;
  dimension119?: string | void;
  dimension120?: string | void;
  dimension121?: string | void;
  dimension122?: string | void;
  dimension123?: string | void;
  dimension124?: string | void;
  dimension125?: string | void;
  dimension126?: string | void;
  dimension127?: string | void;
  dimension128?: string | void;
  dimension129?: string | void;
  dimension130?: string | void;
  dimension131?: string | void;
  dimension132?: string | void;
  dimension133?: string | void;
  dimension134?: string | void;
  dimension135?: string | void;
  dimension136?: string | void;
  dimension137?: string | void;
  dimension138?: string | void;
  dimension139?: string | void;
  dimension140?: string | void;
  dimension141?: string | void;
  dimension142?: string | void;
  dimension143?: string | void;
  dimension144?: string | void;
  dimension145?: string | void;
  dimension146?: string | void;
  dimension147?: string | void;
  dimension148?: string | void;
  dimension149?: string | void;
  dimension150?: string | void;
  dimension151?: string | void;
  dimension152?: string | void;
  dimension153?: string | void;
  dimension154?: string | void;
  dimension155?: string | void;
  dimension156?: string | void;
  dimension157?: string | void;
  dimension158?: string | void;
  dimension159?: string | void;
  dimension160?: string | void;
  dimension161?: string | void;
  dimension162?: string | void;
  dimension163?: string | void;
  dimension164?: string | void;
  dimension165?: string | void;
  dimension166?: string | void;
  dimension167?: string | void;
  dimension168?: string | void;
  dimension169?: string | void;
  dimension170?: string | void;
  dimension171?: string | void;
  dimension172?: string | void;
  dimension173?: string | void;
  dimension174?: string | void;
  dimension175?: string | void;
  dimension176?: string | void;
  dimension177?: string | void;
  dimension178?: string | void;
  dimension179?: string | void;
  dimension180?: string | void;
  dimension181?: string | void;
  dimension182?: string | void;
  dimension183?: string | void;
  dimension184?: string | void;
  dimension185?: string | void;
  dimension186?: string | void;
  dimension187?: string | void;
  dimension188?: string | void;
  dimension189?: string | void;
  dimension190?: string | void;
  dimension191?: string | void;
  dimension192?: string | void;
  dimension193?: string | void;
  dimension194?: string | void;
  dimension195?: string | void;
  dimension196?: string | void;
  dimension197?: string | void;
  dimension198?: string | void;
  dimension199?: string | void;
  dimension200?: string | void;
  encoding?: string | void;
  eventAction?: string | void;
  eventCategory?: string | void;
  eventLabel?: string | void;
  eventValue?: number | void;
  exDescription?: string | void;
  exFatal?: boolean | void;
  expId?: string | void;
  expVar?: string | void;
  flashVersion?: string | void;
  forceSSL?: boolean | void;
  hitCallback?: () => void;
  hitType?: HitType | void;
  hostname?: string | void;
  id?: string | void;
  javaEnabled?: boolean | void;
  language?: string | void;
  legacyCookieDomain?: string | void;
  legacyHistoryImport?: boolean | void;
  linkid?: string | void;
  list?: string | void;
  location?: string | void;
  metric1?: string | number | void;
  metric2?: string | number | void;
  metric3?: string | number | void;
  metric4?: string | number | void;
  metric5?: string | number | void;
  metric6?: string | number | void;
  metric7?: string | number | void;
  metric8?: string | number | void;
  metric9?: string | number | void;
  metric10?: string | number | void;
  metric11?: string | number | void;
  metric12?: string | number | void;
  metric13?: string | number | void;
  metric14?: string | number | void;
  metric15?: string | number | void;
  metric16?: string | number | void;
  metric17?: string | number | void;
  metric18?: string | number | void;
  metric19?: string | number | void;
  metric20?: string | number | void;
  metric21?: string | number | void;
  metric22?: string | number | void;
  metric23?: string | number | void;
  metric24?: string | number | void;
  metric25?: string | number | void;
  metric26?: string | number | void;
  metric27?: string | number | void;
  metric28?: string | number | void;
  metric29?: string | number | void;
  metric30?: string | number | void;
  metric31?: string | number | void;
  metric32?: string | number | void;
  metric33?: string | number | void;
  metric34?: string | number | void;
  metric35?: string | number | void;
  metric36?: string | number | void;
  metric37?: string | number | void;
  metric38?: string | number | void;
  metric39?: string | number | void;
  metric40?: string | number | void;
  metric41?: string | number | void;
  metric42?: string | number | void;
  metric43?: string | number | void;
  metric44?: string | number | void;
  metric45?: string | number | void;
  metric46?: string | number | void;
  metric47?: string | number | void;
  metric48?: string | number | void;
  metric49?: string | number | void;
  metric50?: string | number | void;
  metric51?: string | number | void;
  metric52?: string | number | void;
  metric53?: string | number | void;
  metric54?: string | number | void;
  metric55?: string | number | void;
  metric56?: string | number | void;
  metric57?: string | number | void;
  metric58?: string | number | void;
  metric59?: string | number | void;
  metric60?: string | number | void;
  metric61?: string | number | void;
  metric62?: string | number | void;
  metric63?: string | number | void;
  metric64?: string | number | void;
  metric65?: string | number | void;
  metric66?: string | number | void;
  metric67?: string | number | void;
  metric68?: string | number | void;
  metric69?: string | number | void;
  metric70?: string | number | void;
  metric71?: string | number | void;
  metric72?: string | number | void;
  metric73?: string | number | void;
  metric74?: string | number | void;
  metric75?: string | number | void;
  metric76?: string | number | void;
  metric77?: string | number | void;
  metric78?: string | number | void;
  metric79?: string | number | void;
  metric80?: string | number | void;
  metric81?: string | number | void;
  metric82?: string | number | void;
  metric83?: string | number | void;
  metric84?: string | number | void;
  metric85?: string | number | void;
  metric86?: string | number | void;
  metric87?: string | number | void;
  metric88?: string | number | void;
  metric89?: string | number | void;
  metric90?: string | number | void;
  metric91?: string | number | void;
  metric92?: string | number | void;
  metric93?: string | number | void;
  metric94?: string | number | void;
  metric95?: string | number | void;
  metric96?: string | number | void;
  metric97?: string | number | void;
  metric98?: string | number | void;
  metric99?: string | number | void;
  metric100?: string | number | void;
  metric101?: string | number | void;
  metric102?: string | number | void;
  metric103?: string | number | void;
  metric104?: string | number | void;
  metric105?: string | number | void;
  metric106?: string | number | void;
  metric107?: string | number | void;
  metric108?: string | number | void;
  metric109?: string | number | void;
  metric110?: string | number | void;
  metric111?: string | number | void;
  metric112?: string | number | void;
  metric113?: string | number | void;
  metric114?: string | number | void;
  metric115?: string | number | void;
  metric116?: string | number | void;
  metric117?: string | number | void;
  metric118?: string | number | void;
  metric119?: string | number | void;
  metric120?: string | number | void;
  metric121?: string | number | void;
  metric122?: string | number | void;
  metric123?: string | number | void;
  metric124?: string | number | void;
  metric125?: string | number | void;
  metric126?: string | number | void;
  metric127?: string | number | void;
  metric128?: string | number | void;
  metric129?: string | number | void;
  metric130?: string | number | void;
  metric131?: string | number | void;
  metric132?: string | number | void;
  metric133?: string | number | void;
  metric134?: string | number | void;
  metric135?: string | number | void;
  metric136?: string | number | void;
  metric137?: string | number | void;
  metric138?: string | number | void;
  metric139?: string | number | void;
  metric140?: string | number | void;
  metric141?: string | number | void;
  metric142?: string | number | void;
  metric143?: string | number | void;
  metric144?: string | number | void;
  metric145?: string | number | void;
  metric146?: string | number | void;
  metric147?: string | number | void;
  metric148?: string | number | void;
  metric149?: string | number | void;
  metric150?: string | number | void;
  metric151?: string | number | void;
  metric152?: string | number | void;
  metric153?: string | number | void;
  metric154?: string | number | void;
  metric155?: string | number | void;
  metric156?: string | number | void;
  metric157?: string | number | void;
  metric158?: string | number | void;
  metric159?: string | number | void;
  metric160?: string | number | void;
  metric161?: string | number | void;
  metric162?: string | number | void;
  metric163?: string | number | void;
  metric164?: string | number | void;
  metric165?: string | number | void;
  metric166?: string | number | void;
  metric167?: string | number | void;
  metric168?: string | number | void;
  metric169?: string | number | void;
  metric170?: string | number | void;
  metric171?: string | number | void;
  metric172?: string | number | void;
  metric173?: string | number | void;
  metric174?: string | number | void;
  metric175?: string | number | void;
  metric176?: string | number | void;
  metric177?: string | number | void;
  metric178?: string | number | void;
  metric179?: string | number | void;
  metric180?: string | number | void;
  metric181?: string | number | void;
  metric182?: string | number | void;
  metric183?: string | number | void;
  metric184?: string | number | void;
  metric185?: string | number | void;
  metric186?: string | number | void;
  metric187?: string | number | void;
  metric188?: string | number | void;
  metric189?: string | number | void;
  metric190?: string | number | void;
  metric191?: string | number | void;
  metric192?: string | number | void;
  metric193?: string | number | void;
  metric194?: string | number | void;
  metric195?: string | number | void;
  metric196?: string | number | void;
  metric197?: string | number | void;
  metric198?: string | number | void;
  metric199?: string | number | void;
  metric200?: string | number | void;
  name?: string | void;
  nonInteraction?: boolean | void;
  option?: string | void;
  page?: string | void;
  position?: number | string | void;
  price?: string | void;
  quantity?: number | void;
  queueTime?: number | void;
  referrer?: string | void;
  revenue?: string | void;
  sampleRate?: number | void;
  sessionControl?: string | void;
  siteSpeedSampleRate?: number | void;
  screenColors?: string | void;
  screenName?: string | void;
  screenResolution?: string | void;
  shipping?: string | void;
  socialAction?: string | void;
  socialNetwork?: string | void;
  socialTarget?: string | void;
  some?: string | void;
  step?: boolean | number | void;
  storage?: string | void;
  storeGac?: boolean | void;
  tax?: string | void;
  timingCategory?: string | void;
  timingLabel?: string | void;
  timingValue?: number | void;
  timingVar?: string | void;
  title?: string | void;
  transport?: string | void;
  useBeacon?: boolean | void;
  userId?: string | void;
  variant?: string | void;
  viewportSize?: string | void;
}

declare var ga: {
  l: number,
  q: any[],

  (
    command: 'send',
    hitType: 'event',
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number,
    fieldsObject?: FieldsObject
  ): void,
  (
    command: 'send',
    hitType: 'event',
    fieldsObject: {
      eventCategory: string,
      eventAction: string,
      eventLabel?: string | void,
      eventValue?: number | void,
      nonInteraction?: boolean | void
    }
  ): void,
  (
    command: 'send',
    fieldsObject: {
      hitType: HitType, // 'event'
      eventCategory: string,
      eventAction: string,
      eventLabel?: string | void,
      eventValue?: number | void,
      nonInteraction?: boolean | void
    }
  ): void,
  (command: 'send', hitType: 'pageview', page: string): void,
  (
    command: 'send',
    hitType: 'social',
    socialNetwork: string,
    socialAction: string,
    socialTarget: string
  ): void,
  (
    command: 'send',
    hitType: 'social',
    fieldsObject: {
      socialNetwork: string,
      socialAction: string,
      socialTarget: string
    }
  ): void,
  (
    command: 'send',
    hitType: 'timing',
    timingCategory: string,
    timingVar: string,
    timingValue: number
  ): void,
  (
    command: 'send',
    hitType: 'timing',
    fieldsObject: {
      timingCategory: string,
      timingVar: string,
      timingValue: number
    }
  ): void,
  (command: 'send', fieldsObject: FieldsObject): void,
  (command: string, hitType: HitType, ...fields: any[]): void,
  (command: 'require', pluginName: string, pluginOptions?: any): void,
  (
    command: 'provide',
    pluginName: string,
    pluginConstructor: (tracker: Tracker, pluginOptions?: Object) => void
  ): void,

  (
    command: 'create',
    trackingId: string,
    cookieDomain?: string,
    name?: string,
    fieldsObject?: FieldsObject
  ): void,
  (command: 'remove'): void,

  (command: string, ...fields: any[]): void,

  (readyCallback: (defaultTracker?: Tracker) => void): void,

  create(
    trackingId: string,
    cookieDomain: string,
    name: string,
    fieldsObject?: FieldsObject
  ): Tracker,
  create(
    trackingId: string,
    cookieDomain: string,
    fieldsObject?: FieldsObject
  ): Tracker,
  create(trackingId: string, fieldsObject?: FieldsObject): Tracker,

  getAll(): Tracker[],
  getByName(name: string): Tracker,
  remove(name: string): void
}

declare var gaClassic: GoogleAnalytics
declare var _gaq: GoogleAnalyticsCode
declare var _gat: GoogleAnalyticsTracker
