import { XMLParser } from 'fast-xml-parser'

/**
 * Date and time of server response
 * example: 20240112121914.384[-5:EST]
 * format: YYYYMMDDHHMMSS.ZZZ[TZ]
 */
type DTTMTYPE = string

export interface OFX {
  /**
   * Response information
   */
  SIGNONMSGSRSV1: {
    SONRS: {
      /**
       * General error reporting aggregate
       */
      STATUS: {
        CODE: number
        SEVERITY: string
        MESSAGE?: string
      }
      /**
       * Date and time of server response
       * example: 20240112121914.384[-5:EST]
       * format: YYYYMMDDHHMMSS.ZZZ[TZ]
       */
      DTSERVER: DTTMTYPE
      USERKEY?: string
      TSKEYEXPIRE?: DTTMTYPE
      /**
       * Language for messages, 3 letter ISO 639-2 code, e.g. "ENG"
       */
      LANGUAGE: string
      DTPROFUP?: DTTMTYPE
      DTACCTUP?: DTTMTYPE
      FI?: {
        ORG: number
        FID?: string
      }
      SESSCOOKIE?: string
    }
  }
  INVSTMTMSGSRSV1: {
    /**
     * Investment Statement Transaction Response
     */
    INVSTMTTRNRS: {
      /**
       * Investment Statement Response
       */
      INVSTMTRS: {
        /**
         * Balance date
         * example: 20240111202000.000[-5:EST]
         * format: YYYYMMDDHHMMSS.ZZZ[TZ]
         */
        DTASOF: DTTMTYPE
        /**
         * Currency code, 3 character ISO 4217 code, e.g. "USD"
         */
        CURDEF: string
        /**
         * Marketing information
         */
        MKTGINFO?: string
        /**
         * Investment Account From
         */
        INVACCTFROM?: {
          BROKERID: number
          ACCTID: string
        }
        /**
         * Balances
         */
        INVBAL?: {
          AVAILCASH: number
          MARGINBALANCE: number
          SHORTBALANCE: number
          BUYPOWER?: number
          BALLIST?: {
            /**
             * Balance record
             */
            BAL: {
              NAME: string
              DESC: string
              BALTYPE: string
              VALUE: number
              DTASOF?: DTTMTYPE
              CURRENCY?: string
            }[]
          }
        }
        /**
         * Position List
         */
        INVPOSLIST?: {
          /**
           * Mutual Fund Position
           */
          POSMF?: {
            INVPOS: INVPOS
            UNITSSTREET?: number
            UNITSUSER?: number
            REINVDIV?: boolean
            REINVCG?: boolean
          }[]
          /**
           * Stock Position
           */
          POSSTOCK?: {
            INVPOS: INVPOS
            UNITSSTREET?: number
            UNITSUSER?: number
            REINVDIV?: boolean
          }[]
          /**
           * Debt Position
           */
          POSDEBT?: {
            INVPOS: INVPOS
          }[]
          /**
           * Option Position
           */
          POSOPT?: {
            INVPOS: INVPOS
            /**
             * How the option is secured: NAKED or COVERED
             */
            SECURED?: string
          }[]
          /**
           * Other Security Type Position
           */
          POSOTHER?: {
            INVPOS: INVPOS
          }[]
        }
        /**
         * Transaction List
         */
        INVTRANLIST?: {
          /**
           * Starting date
           * example: 20240111202000.000[-5:EST]
           * format: YYYYMMDDHHMMSS.ZZZ[TZ]
           */
          DTSTART: DTTMTYPE
          /**
           * Ending date
           * example: 20240111202000.000[-5:EST]
           * format: YYYYMMDDHHMMSS.ZZZ[TZ]
           */
          DTEND: string
          /**
           * Buy Debt Transaction
           */
          BUYDEBT?: {
            INVBUY: INVBUY
            // <!ELEMENT ACCRDINT  - O %AMTTYPE >
            ACCRDINT?: number
          }[]
          /**
           * Buy Mutual Fund Transaction
           */
          BUYMF?: {
            INVBUY: INVBUY
            /**
             * Buy Type: BUY or BUYTOCOVER
             */
            BUYTYPE: string
            /**
             * Related Transaction ID
             */
            RELFITID?: string
          }[]
          /**
           * Buy Option Transaction
           */
          BUYOPT?: {
            INVBUY: INVBUY
            /**
             * Option Buy Type
             */
            OPTBUYTYPE: string
            /**
             * Number of shares per contract
             */
            SHPERCTRCT: number
          }[]
          /**
           * Buy Other Transaction
           */
          BUYOTHER?: {
            INVBUY: INVBUY
          }[]
          /**
           * Buy Stock Transaction
           */
          BUYSTOCK?: {
            INVBUY: INVBUY
            /**
             * Buy Type: BUY or BUYTOCOVER
             */
            BUYTYPE: string
          }[]
          /**
           * Closure of Option Transaction
           */
          CLOSUREOPT?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            /**
             * losure of option action: EXPIRE, EXERCISE, ASSIGN
             */
            OPTACTION: string
            UNITS: number
            /**
             * Number of shares per contract
             */
            SHPERCTRCT: number
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            /**
             * Related Transaction ID
             */
            RELFITID?: string
            GAIN?: number
          }[]
          /**
           * Income Transaction
           */
          INCOME?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            /**
             * Type of Income
             */
            INCOMETYPE: string
            TOTAL: number
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            /**
             * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
             */
            SUBACCTFUND: string
            TAXEXEMPT?: boolean
            WITHHOLDING?: number
            CURRENCY?: CURRENCY
            ORIGCURRENCY?: CURRENCY
          }[]
          /**
           * Investment Banking Transaction
           */
          INVBANKTRAN?: {
            /**
             * Statement Transaction
             */
            STMTTRN: {
              /**
               * Status of request - see section 5.5.1.4.1 for possible values
               */
              TRNTYPE: string
              /**
               * Date transaction was posted to account
               */
              DTPOSTED: DTTMTYPE
              /**
               * Date user initiated transaction, if known
               */
              DTUSER?: DTTMTYPE
              /**
               * Date funds are available
               */
              DTAVAIL?: DTTMTYPE
              /**
               * Transaction amount
               */
              TRNAMT: number
              /**
               * Transaction ID issued by financial institution. This ID is used to detect duplicate downloads
               */
              FITID: string
              /**
               * If present, this is the FITID of a previously sent transaction that is corrected by this record.
               * This transaction replaces or deletes the transaction that it corrects.
               */
              CORRECTFITID?: string
              /**
               * Actions can be REPLACE or DELETE.
               * REPLACE replaces the transaction referenced by CORRECTFITID;
               * DELETE deletes it.
               */
              CORRECTACTION?: string
              /**
               * Server ID
               */
              SRVRTID?: string
              /**
               * Check number
               */
              CHECKNUM?: string
              /**
               * Reference number
               */
              REFNUM?: string
              /**
               * Standard Industrial Code
               */
              SIC?: number
              /**
               * Server-assigned standard payee ID
               */
              PAYEEID?: string
              NAME?: string
              PAYEE?: string
              /**
               * Bank Account To
               */
              BANKACCTTO?: {
                /**
                 * Bank ID
                 */
                BANKID: string
                /**
                 * Branch ID
                 */
                BRANCHID?: string
                /**
                 * Account ID
                 */
                ACCTID: string
                /**
                 * Account Type
                 */
                ACCTTYPE: string
                /**
                 * Account Key
                 */
                ACCTKEY?: string
              }
              /**
               * Credit Card Account To
               */
              CCACCTTO?: {
                /**
                 * Account ID
                 */
                ACCTID: string
                /**
                 * Account Key
                 */
                ACCTKEY?: string
              }
              MEMO?: string
              CURRENCY?: CURRENCY
              ORIGCURRENCY?: CURRENCY
            }
            /**
             * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
             */
            SUBACCTFUND: string
          }[]
          /**
           * Investment Related Expense Transaction
           */
          INVEXPENSE?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            TOTAL: number
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            /**
             * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
             */
            SUBACCTFUND: string
            CURRENCY?: CURRENCY
            ORIGCURRENCY?: CURRENCY
          }[]
          /**
           * Journaling of Funds between sub-accounts Transaction
           */
          JRNLFUND?: {
            INVTRAN: INVTRAN
            SUBACCTTO: string
            SUBACCTFROM: string
            TOTAL: number
          }[]
          /**
           * Journaling of Security between sub-accounts Transaction
           */
          JRNLSEC?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            SUBACCTTO: string
            SUBACCTFROM: string
            UNITS: number
          }[]
          /**
           * Margin Interest Transaction
           */
          MARGININTEREST?: {
            INVTRAN: INVTRAN
            TOTAL: number
            /**
             * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
             */
            SUBACCTFUND: string
            CURRENCY?: CURRENCY
            ORIGCURRENCY?: CURRENCY
          }[]
          /**
           * Reinvest Transaction
           */
          REINVEST?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            /**
             * Type of Income
             */
            INCOMETYPE: string
            TOTAL: number
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            UNITS: number
            UNITPRICE: number
            COMMISSION?: number
            TAXES?: number
            FEES?: number
            LOAD?: number
            TAXEXEMPT?: boolean
            CURRENCY?: CURRENCY
            ORIGCURRENCY?: CURRENCY
          }[]
          /**
           * Return Of Capital Transaction
           */
          RETOFCAP?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            TOTAL: number
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            /**
             * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
             */
            SUBACCTFUND: string
            CURRENCY?: CURRENCY
            ORIGCURRENCY?: CURRENCY
          }[]
          /**
           * Sell Debt Transaction
           */
          SELLDEBT?: {
            INVSELL: INVSELL
            /**
             * Reason Sell of Debt generated: CALL, MATURITY, SELL
             */
            SELLREASON: string
            ACCRDINT?: number
          }[]
          /**
           * Sell Mutual Fund Transaction
           */
          SELLMF?: {
            INVSELL: INVSELL
            /**
             * Sell Type: SELL or SELLSHORT
             */
            SELLTYPE: string
            /**
             * Average cost basis
             */
            AVGCOSTBASIS?: number
            /**
             * Related Transaction ID
             */
            RELFITID?: string
          }[]
          /**
           * Sell Option Transaction
           */
          SELLOPT?: {
            INVSELL: INVSELL
            /**
             * Option Sell Type: SELLTOCLOSE or SELLTOOPEN
             */
            OPTSELLTYPE: string
            /**
             * Number of shares per contract
             */
            SHPERCTRCT: number
            /**
             * Related Transaction ID
             */
            RELFITID?: string
            /**
             * Related option transaction type: SPREAD, STRADDLE, NONE
             */
            RELTYPE?: string
            /**
             * How the option is secured: NAKED or COVERED
             */
            SECURED?: string
          }[]
          /**
           * Sell Other Transaction
           */
          SELLOTHER?: {
            INVSELL: INVSELL
          }[]
          /**
           * Sell Stock Transaction
           */
          SELLSTOCK?: {
            INVSELL: INVSELL
            /**
             * Sell Type: SELL or SELLSHORT
             */
            SELLTYPE: string
          }[]
          /**
           * Split Transaction
           */
          SPLIT?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            OLDUNITS: number
            NEWUNITS: number
            NUMERATOR: number
            DENOMINATOR: number
            CURRENCY?: CURRENCY
            ORIGCURRENCY?: CURRENCY
            /**
             * Amount of cash recieved from fractional shares
             */
            FRACCASH?: number
            /**
             * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
             */
            SUBACCTFUND?: string
          }[]
          /**
           * Transfer Transaction
           */
          TRANSFER?: {
            INVTRAN: INVTRAN
            /**
             * Security Identifier
             */
            SECID: SECID
            /**
             * Sub-account for the security
             */
            SUBACCTSEC: string
            UNITS: number
            /**
             * Transfer action:IN or OUT
             */
            TFERACTION: string
            /**
             * Position Type: SHORT, LONG
             */
            POSTYPE: string
            /**
             * Investment Account From
             */
            INVACCTFROM?: {
              BROKERID: number
              ACCTID: string
            }
            /**
             * Average cost basis
             */
            AVGCOSTBASIS?: number
            /**
             * Unitprice for Security
             */
            UNITPRICE?: number
            DTPURCHASE?: DTTMTYPE
          }[]
        }
        /**
         * Open Orders List
         */
        INVOOLIST?: {
          /**
           * Buy Debt Open Order
           */
          OOBUYDEBT?: {
            OO: OO
            AUCTION: boolean
            DTAUCTION?: DTTMTYPE
          }[]
          /**
           * Buy Mutual Fund Open Order
           */
          OOBUYMF?: {
            OO: OO
            /**
             * Buy Type: BUY or BUYTOCOVER
             */
            BUYTYPE: string
            /**
             * Type of units: SHARES or CURRENCY
             */
            UNITTYPE: string
          }[]
          /**
           * Buy Option Open Order
           */
          OOBUYOPT?: {
            OO: OO
            /**
             * Option Buy Type
             */
            OPTBUYTYPE: string
          }[]
          /**
           * Buy Other Open Order
           */
          OOBUYOTHER?: {
            OO: OO
            /**
             * Type of units: SHARES or CURRENCY
             */
            UNITTYPE: string
          }[]
          /**
           * Buy Stock Open Order
           */
          OOBUYSTOCK?: {
            OO: OO
            /**
             * Buy Type: BUY or BUYTOCOVER
             */
            BUYTYPE: string
          }[]
          /**
           * Sell Debt Open Order
           */
          OOSELLDEBT?: {
            OO: OO
          }[]
          /**
           * Sell Mutual Fund Open Order
           */
          OOSELLMF?: {
            OO: OO
            /**
             * Sell Type: SELL or SELLSHORT
             */
            SELLTYPE: string
            /**
             * Type of units: SHARES or CURRENCY
             */
            UNITTYPE: string
            SELLALL: boolean
          }[]
          /**
           * Sell Option Open Order
           */
          OOSELLOPT?: {
            OO: OO
            /**
             * Option Sell Type: SELLTOCLOSE or SELLTOOPEN
             */
            OPTSELLTYPE: string
            /**
             * Type of units: SHARES or CURRENCY
             */
            UNITTYPE: string
            SELLALL: boolean
          }[]
          /**
           * Sell Other Security Type Open Order
           */
          OOSELLOTHER?: {
            OO: OO
            /**
             * Type of units: SHARES or CURRENCY
             */
            UNITTYPE: string
          }[]
          /**
           * Sell Stock Open Order
           */
          OOSELLSTOCK?: {
            OO: OO
            /**
             * Sell Type: SELL or SELLSHORT
             */
            SELLTYPE: string
          }[]
          /**
           * Switch Mutual Fund Open Order
           */
          OOSWITCHMF?: {
            OO: OO
            SECID: SECID
            /**
             * Type of units: SHARES or CURRENCY
             */
            UNITTYPE: string
            SWITCHALL: boolean
          }[]
        }
      }
    }
  }
  /**
   * Security Information
   */
  SECLISTMSGSRSV1: {
    /**
     * Security List
     */
    SECLIST: {
      /**
       * Mutual Fund Information
       */
      MFINFO?: MFINFO[]
      /**
       * Stock Information
       */
      STOCKINFO?: STOCKINFO[]
      /**
       * Option Information
       */
      OPTINFO?: OPTINFO[]
      /**
       * Debt Information
       */
      DEBTINFO?: DEBTINFO[]
      /**
       * Other Security Type Information
       */
      OTHERINFO?: OTHERINFO[]
    }
  }
}

export interface CURRENCY {
  CURRATE: number
  CURSYM: string
}

/**
 * Security Identifier
 */
export interface SECID {
  /**
   * Unique ID for the Security
   */
  UNIQUEID: string
  /**
   * Standard used for Unique ID e.g. CUSIP
   */
  UNIQUEIDTYPE: string
}

/**
 * Info all security types have in common
 */
export interface SECINFO {
  /**
   * Security Identifier
   */
  SECID: SECID
  /**
   * Security Name
   */
  SECNAME?: string
  /**
   * Security Ticker Symbol
   */
  TICKER?: string
  /**
   * Financial Institution ID for the Security
   */
  FIID?: string
}

/**
 * Stock Information
 */
export interface STOCKINFO {
  SECINFO: SECINFO
  STOCKTYPE?: string
  YIELD?: number
  DTYIELDASOF?: DTTMTYPE
  /**
   * Asset Class for Security
   */
  ASSETCLASS?: string
  /**
   * FI's Asset Class for Security
   */
  FIASSETCLASS?: string
}

/**
 * Debt Information
 */
export interface DEBTINFO {
  SECINFO: SECINFO
  PARVALUE: string
  DEBTTYPE: string
  DEBTCLASS?: string
  COUPONRT?: number
  DTCOUPON?: DTTMTYPE
  COUPONFREQ?: string
  CALLPRICE?: number
  YIELDTOCALL?: number
  DTCALL?: DTTMTYPE
  CALLTYPE?: string
  YIELDTOMAT?: number
  DTMAT?: DTTMTYPE
  /**
   * Asset Class for Security
   */
  ASSETCLASS?: string
  /**
   * FI's Asset Class for Security
   */
  FIASSETCLASS?: string
}

/**
 * Option Information
 */
export interface OPTINFO {
  SECINFO: SECINFO
  OPTTYPE: string
  STRIKEPRICE: string
  DTEXPIRE: DTTMTYPE
  /**
   * Number of shares per contract
   */
  SHPERCTRCT: number
  SECID?: SECID
  /**
   * Asset Class for Security
   */
  ASSETCLASS?: string
  /**
   * FI's Asset Class for Security
   */
  FIASSETCLASS?: string
}

/**
 * Mutual Fund Information
 */
export interface MFINFO {
  SECINFO: SECINFO
  MFTYPE?: string
  YIELD?: number
  DTYIELDASOF?: DTTMTYPE
  /**
   * Asset Class for Mutual Funds
   */
  MFASSETCLASS?: string
  /**
   * FI's Asset Class for Mutual Funds
   */
  FIMFASSETCLASS?: string
}

/**
 * Other Security Type Information
 */
export interface OTHERINFO {
  SECINFO: SECINFO
  TYPEDESC?: string
  /**
   * Asset Class for Security
   */
  ASSETCLASS?: string
  /**
   * FI's Asset Class for Security
   */
  FIASSETCLASS?: string
}

/**
 * Transaction fields common to many types of transactions
 */
export interface INVTRAN {
  /**
   * Transaction ID issued by financial institution.This ID is used to detect duplicate downloads
   */
  FITID: string
  /**
   * Server ID
   */
  SRVRTID?: string
  /**
   * Trade Date
   */
  DTTRADE: DTTMTYPE
  /**
   * Settlement Date
   */
  DTSETTLE?: DTTMTYPE
  /**
   * Extra information (not in <NAME>), A-255
   */
  MEMO?: string
}

/**
 * Position fields common to and types of positions
 */
export interface INVPOS {
  SECID: SECID
  /**
   * Which sub-account the position is held in: CASH, MARGIN, SHORT, OTHER
   */
  HELDINACCT: string
  /**
   * Position Type: SHORT, LONG
   */
  POSTYPE: string
  UNITS: number
  UNITPRICE: number
  MKTVAL: number
  DTPRICEASOF: DTTMTYPE
  CURRENCY?: CURRENCY
  MEMO?: string
}

/**
 * Transaction fields common to BUY types of transactions
 */
export interface INVBUY {
  INVTRAN: INVTRAN
  SECID: SECID
  UNITS: number
  UNITPRICE: number
  MARKUP?: number
  COMMISSION?: number
  TAXES?: number
  FEES?: number
  LOAD?: number
  TOTAL: number
  CURRENCY?: CURRENCY
  ORIGCURRENCY?: CURRENCY
  /**
   * Sub-account for the security
   */
  SUBACCTSEC: string
  /**
   * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
   */
  SUBACCTFUND: string
}

/**
 * Transaction fields common to SELL types of transactions
 */
export interface INVSELL {
  INVTRAN: INVTRAN
  SECID: SECID
  UNITS: number
  UNITPRICE: number
  MARKDOWN?: number
  COMMISSION?: number
  TAXES?: number
  FEES?: number
  LOAD?: number
  WITHHOLDING?: number
  TAXEXEMPT?: boolean
  TOTAL: number
  GAIN?: number
  CURRENCY?: CURRENCY
  ORIGCURRENCY?: CURRENCY
  /**
   * Sub-account for the security
   */
  SUBACCTSEC: string
  /**
   * Sub-account for the funds involved in the trade: CASH, SHORT, MARGIN, OTHER
   */
  SUBACCTFUND: string
}

/**
 * Open Order fields common to all open orders
 */
export interface OO {
  /**
   * Transaction ID issued by financial institution.This ID is used to detect duplicate downloads
   */
  FITID: string
  /**
   * Server ID
   */
  SRVRTID?: string
  /**
   * Security Identifier
   */
  SECID: SECID
  DTPLACED: DTTMTYPE
  UNITS: number
  SUBACCT: string
  DURATION: string
  RESTRICTION: string
  MINUNITS?: number
  LIMITPRICE?: number
  STOPPRICE?: number
  MEMO?: string
  CURRENCY?: CURRENCY
}

/**
 * Parses IBKR MSMoney OFX report
 * The spec can be found here: https://www.financialdataexchange.org/FDX/About/OFX-Work-Group.aspx?WebsiteKey=deae9d6d-1a7a-457b-a678-8a5517f8a474&a315d1c24e44=2#a315d1c24e44
 * switch to spec tab, at the bottom of the page you can find "Version 1.0.2" spec
 * definitions are stored here as well for reference
 * @param text ofx report
 */
export function parseMsMoneyOfxReport(text: string): OFX {
  const parser = new XMLParser()
  const parsed = parser.parse(text) as { OFX: OFX }
  return fixArrays(parsed.OFX)
}

function fixArrays(ofx: OFX): OFX {
  ofx.SECLISTMSGSRSV1.SECLIST.DEBTINFO = ofx.SECLISTMSGSRSV1.SECLIST.DEBTINFO
    ? Array.isArray(ofx.SECLISTMSGSRSV1.SECLIST.DEBTINFO)
      ? ofx.SECLISTMSGSRSV1.SECLIST.DEBTINFO
      : [ofx.SECLISTMSGSRSV1.SECLIST.DEBTINFO]
    : undefined

  ofx.SECLISTMSGSRSV1.SECLIST.MFINFO = ofx.SECLISTMSGSRSV1.SECLIST.MFINFO
    ? Array.isArray(ofx.SECLISTMSGSRSV1.SECLIST.MFINFO)
      ? ofx.SECLISTMSGSRSV1.SECLIST.MFINFO
      : [ofx.SECLISTMSGSRSV1.SECLIST.MFINFO]
    : undefined

  ofx.SECLISTMSGSRSV1.SECLIST.OPTINFO = ofx.SECLISTMSGSRSV1.SECLIST.OPTINFO
    ? Array.isArray(ofx.SECLISTMSGSRSV1.SECLIST.OPTINFO)
      ? ofx.SECLISTMSGSRSV1.SECLIST.OPTINFO
      : [ofx.SECLISTMSGSRSV1.SECLIST.OPTINFO]
    : undefined

  ofx.SECLISTMSGSRSV1.SECLIST.OTHERINFO = ofx.SECLISTMSGSRSV1.SECLIST.OTHERINFO
    ? Array.isArray(ofx.SECLISTMSGSRSV1.SECLIST.OTHERINFO)
      ? ofx.SECLISTMSGSRSV1.SECLIST.OTHERINFO
      : [ofx.SECLISTMSGSRSV1.SECLIST.OTHERINFO]
    : undefined

  ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO = ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO
    ? Array.isArray(ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO)
      ? ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO
      : [ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO]
    : undefined

  if (ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL && ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL.BALLIST) {
    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL.BALLIST.BAL = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL.BALLIST.BAL
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL.BALLIST.BAL)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL.BALLIST.BAL
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVBAL.BALLIST.BAL]
      : []
  }

  if (ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST) {
    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSMF = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSMF
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSMF)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSMF
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSMF]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSSTOCK = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSSTOCK
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSSTOCK)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSSTOCK
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSSTOCK]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSDEBT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSDEBT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSDEBT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSDEBT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSDEBT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOPT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOPT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOPT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOPT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOPT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOTHER = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOTHER
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOTHER)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOTHER
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST.POSOTHER]
      : undefined
  }

  if (ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST) {
    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYDEBT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYDEBT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYDEBT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYDEBT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYDEBT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYMF = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYMF
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYMF)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYMF
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYMF]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOPT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOPT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOPT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOPT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOPT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOTHER = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOTHER
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOTHER)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOTHER
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYOTHER]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYSTOCK = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYSTOCK
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYSTOCK)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYSTOCK
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.BUYSTOCK]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.CLOSUREOPT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.CLOSUREOPT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.CLOSUREOPT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.CLOSUREOPT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.CLOSUREOPT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INCOME = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INCOME
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INCOME)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INCOME
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INCOME]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVBANKTRAN = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVBANKTRAN
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVBANKTRAN)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVBANKTRAN
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVBANKTRAN]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVEXPENSE = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVEXPENSE
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVEXPENSE)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVEXPENSE
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.INVEXPENSE]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLFUND = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLFUND
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLFUND)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLFUND
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLFUND]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLSEC = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLSEC
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLSEC)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLSEC
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.JRNLSEC]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.MARGININTEREST = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.MARGININTEREST
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.MARGININTEREST)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.MARGININTEREST
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.MARGININTEREST]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.REINVEST = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.REINVEST
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.REINVEST)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.REINVEST
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.REINVEST]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.RETOFCAP = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.RETOFCAP
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.RETOFCAP)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.RETOFCAP
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.RETOFCAP]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLDEBT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLDEBT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLDEBT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLDEBT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLDEBT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLMF = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLMF
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLMF)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLMF
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLMF]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOPT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOPT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOPT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOPT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOPT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOTHER = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOTHER
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOTHER)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOTHER
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLOTHER]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLSTOCK = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLSTOCK
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLSTOCK)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLSTOCK
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SELLSTOCK]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SPLIT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SPLIT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SPLIT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SPLIT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.SPLIT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.TRANSFER = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.TRANSFER
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.TRANSFER)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.TRANSFER
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST.TRANSFER]
      : undefined
  }

  if (ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST) {
    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYDEBT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYDEBT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYDEBT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYDEBT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYDEBT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYMF = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYMF
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYMF)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYMF
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYMF]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOPT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOPT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOPT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOPT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOPT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOTHER = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOTHER
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOTHER)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOTHER
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYOTHER]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYSTOCK = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYSTOCK
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYSTOCK)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYSTOCK
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOBUYSTOCK]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLDEBT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLDEBT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLDEBT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLDEBT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLDEBT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLMF = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLMF
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLMF)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLMF
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLMF]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOPT = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOPT
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOPT)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOPT
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOPT]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOTHER = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOTHER
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOTHER)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOTHER
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLOTHER]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLSTOCK = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLSTOCK
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLSTOCK)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLSTOCK
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSELLSTOCK]
      : undefined

    ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSWITCHMF = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSWITCHMF
      ? Array.isArray(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSWITCHMF)
        ? ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSWITCHMF
        : [ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVOOLIST.OOSWITCHMF]
      : undefined
  }

  return ofx
}

export function areSecurityIdenfiersEqual(left: SECID, right: SECID): boolean {
  return left.UNIQUEID === right.UNIQUEID && left.UNIQUEIDTYPE === right.UNIQUEIDTYPE ? true : false
}

export function findSecurity(ofx: OFX, secid: SECID) {
  const { DEBTINFO, MFINFO, OPTINFO, OTHERINFO, STOCKINFO } = ofx.SECLISTMSGSRSV1.SECLIST
  return {
    DEBTINFO: DEBTINFO?.find((sec) => areSecurityIdenfiersEqual(sec.SECINFO.SECID, secid)),
    MFINFO: MFINFO?.find((sec) => areSecurityIdenfiersEqual(sec.SECINFO.SECID, secid)),
    OPTINFO: OPTINFO?.find((sec) => areSecurityIdenfiersEqual(sec.SECINFO.SECID, secid)),
    OTHERINFO: OTHERINFO?.find((sec) => areSecurityIdenfiersEqual(sec.SECINFO.SECID, secid)),
    STOCKINFO: STOCKINFO?.find((sec) => areSecurityIdenfiersEqual(sec.SECINFO.SECID, secid)),
  }
}

export function findSecurityInfo(ofx: OFX, secid: SECID): SECINFO | null {
  const { DEBTINFO, MFINFO, OPTINFO, OTHERINFO, STOCKINFO } = findSecurity(ofx, secid)
  return DEBTINFO?.SECINFO || MFINFO?.SECINFO || OPTINFO?.SECINFO || OTHERINFO?.SECINFO || STOCKINFO?.SECINFO || null
}

export function parseOfxDateTime(input: DTTMTYPE): Date {
  const year = parseInt(input.slice(0, 4), 10)
  const month = parseInt(input.slice(4, 6), 10) - 1
  const day = parseInt(input.slice(6, 8), 10)
  const hours = parseInt(input.slice(8, 10), 10)
  const minutes = parseInt(input.slice(10, 12), 10)
  const seconds = parseInt(input.slice(12, 14), 10)
  const milliseconds = parseInt(input.slice(15, 18), 10)
  const timezoneOffsetInHours = parseInt(input.slice(19, -1).split(':').shift()!, 10)
  const parsedDate = new Date(year, month, day, hours, minutes, seconds, milliseconds)
  parsedDate.setMinutes(parsedDate.getMinutes() + timezoneOffsetInHours * 60)
  return parsedDate
}

/*
npx ts-node -O '{"module": "commonjs"}' src/utils/ibkr/ofx.ts static/exchange-rate-differences/interactive-brokers/dividends/sample.ofx
*/
// if (require.main === module) {
//   console.log(parseMsMoneyOfxReport(require('fs').readFileSync(process.argv[2], 'utf-8')))
// }
