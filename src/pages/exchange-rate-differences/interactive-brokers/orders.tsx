import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC } from 'gatsby'
import '../../../styles/common.css'
import { currency } from '../../../utils/formatters'
import { getExchangeRate } from '../../../utils/exchange-rate'
import { getPrice } from '../../../utils/yahoo'
import statements from '../../../images/exchange-rate-differences/statements.png'
import msmoney from '../../../images/exchange-rate-differences/msmoney.png'
import popup from '../../../images/exchange-rate-differences/popup.png'
import Join from '../../../components/join'
import Hero from '../../../components/hero'
import ExchangeRateDifferencesLinks from '../../../components/exchange-rate-differences-links'
import Subscribe from '../../../components/subscribe'

const sample = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <DTSERVER>20240112121914.384[-5:EST]</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
      <FI>
        <ORG>0</ORG>
      </FI>
      <INTU.BID>0</INTU.BID>
      <INTU.USERID>U0000000</INTU.USERID>
    </SONRS>
  </SIGNONMSGSRSV1>
  <INVSTMTMSGSRSV1>
    <INVSTMTTRNRS>
      <TRNUID>0</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <INVSTMTRS>
        <DTASOF>20240111202000.000[-5:EST]</DTASOF>
        <CURDEF>USD</CURDEF>
        <INVACCTFROM>
          <BROKERID>0</BROKERID>
          <ACCTID>U0000000</ACCTID>
        </INVACCTFROM>
        <INVTRANLIST>
          <DTSTART>20231031202000.000[-4:EDT]</DTSTART>
          <DTEND>20240111202000.000[-5:EST]</DTEND>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231115U00000000000000001</FITID>
                <DTTRADE>20231115093842.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>03831W108</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>12</UNITS>
              <UNITPRICE>41.26</UNITPRICE>
              <COMMISSION>1.53865725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-496.65865725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231204U00000000000000002</FITID>
                <DTTRADE>20231204134806.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>20030N101</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>12</UNITS>
              <UNITPRICE>43.025</UNITPRICE>
              <COMMISSION>1.50265725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-517.80265725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231106U00000000000000003</FITID>
                <DTTRADE>20231106095909.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>56501R106</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>20</UNITS>
              <UNITPRICE>18.56</UNITPRICE>
              <COMMISSION>1.47225725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-372.67225725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231226U00000000000000004</FITID>
                <DTTRADE>20231226102904.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>55305B101</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>4</UNITS>
              <UNITPRICE>135</UNITPRICE>
              <COMMISSION>1.50105725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-541.50105725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20240103U00000000000000005</FITID>
                <DTTRADE>20240103151511.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>607828100</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>9</UNITS>
              <UNITPRICE>58.09</UNITPRICE>
              <COMMISSION>1.52905725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-524.33905725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231106U00000000000000006</FITID>
                <DTTRADE>20231106100338.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>594918104</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>1</UNITS>
              <UNITPRICE>355.58</UNITPRICE>
              <COMMISSION>1.49835725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-357.07835725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231115U00000000000000007</FITID>
                <DTTRADE>20231115094314.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>594918104</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>1</UNITS>
              <UNITPRICE>370.49</UNITPRICE>
              <COMMISSION>1.50045725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-371.99045725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231127U00000000000000008</FITID>
                <DTTRADE>20231127114630.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>594918104</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>1</UNITS>
              <UNITPRICE>378.12</UNITPRICE>
              <COMMISSION>1.49835725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-379.61835725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231204U00000000000000009</FITID>
                <DTTRADE>20231204134844.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>594918104</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>1</UNITS>
              <UNITPRICE>368.49</UNITPRICE>
              <COMMISSION>1.50045725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-369.99045725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20231226U00000000000000010</FITID>
                <DTTRADE>20231226103354.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>594918104</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>1</UNITS>
              <UNITPRICE>375.16</UNITPRICE>
              <COMMISSION>1.50045725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-376.66045725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
          <BUYSTOCK>
            <INVBUY>
              <INVTRAN>
                <FITID>20240103U00000000000000011</FITID>
                <DTTRADE>20240103151559.000[-5:EST]</DTTRADE>
              </INVTRAN>
              <SECID>
                <UNIQUEID>594918104</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <UNITS>2</UNITS>
              <UNITPRICE>371.34</UNITPRICE>
              <COMMISSION>1.50065725</COMMISSION>
              <TAXES>0</TAXES>
              <TOTAL>-744.18065725</TOTAL>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
              <SUBACCTSEC>CASH</SUBACCTSEC>
              <SUBACCTFUND>CASH</SUBACCTFUND>
            </INVBUY>
            <BUYTYPE>BUY</BUYTYPE>
          </BUYSTOCK>
        </INVTRANLIST>
        <INVPOSLIST>
          <POSSTOCK>
            <INVPOS>
              <SECID>
                <UNIQUEID>023135106</UNIQUEID>
                <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
              </SECID>
              <HELDINACCT>CASH</HELDINACCT>
              <POSTYPE>LONG</POSTYPE>
              <UNITS>3</UNITS>
              <UNITPRICE>155.18</UNITPRICE>
              <MKTVAL>465.54</MKTVAL>
              <DTPRICEASOF>20240111202000.000[-5:EST]</DTPRICEASOF>
              <CURRENCY>
                <CURRATE>1.0</CURRATE>
                <CURSYM>USD</CURSYM>
              </CURRENCY>
            </INVPOS>
          </POSSTOCK>
        </INVPOSLIST>
        <INVBAL>
          <AVAILCASH>954.7011311</AVAILCASH>
          <MARGINBALANCE>0</MARGINBALANCE>
          <SHORTBALANCE>0</SHORTBALANCE>
        </INVBAL>
      </INVSTMTRS>
    </INVSTMTTRNRS>
  </INVSTMTMSGSRSV1>
  <SECLISTMSGSRSV1>
    <SECLIST>
      <STOCKINFO>
        <SECINFO>
          <SECID>
            <UNIQUEID>03831W108</UNIQUEID>
            <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
          </SECID>
          <SECNAME>APP APPLOVIN CORP-CLASS A</SECNAME>
          <TICKER>APP</TICKER>
          <FIID>481863646</FIID>
        </SECINFO>
      </STOCKINFO>
      <STOCKINFO>
        <SECINFO>
          <SECID>
            <UNIQUEID>20030N101</UNIQUEID>
            <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
          </SECID>
          <SECNAME>CMCSA COMCAST CORP-CLASS A</SECNAME>
          <TICKER>CMCSA</TICKER>
          <FIID>267748</FIID>
        </SECINFO>
      </STOCKINFO>
      <STOCKINFO>
        <SECINFO>
          <SECID>
            <UNIQUEID>56501R106</UNIQUEID>
            <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
          </SECID>
          <SECNAME>MFC MANULIFE FINANCIAL CORP</SECNAME>
          <TICKER>MFC</TICKER>
          <FIID>1447100</FIID>
        </SECINFO>
      </STOCKINFO>
      <STOCKINFO>
        <SECINFO>
          <SECID>
            <UNIQUEID>55305B101</UNIQUEID>
            <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
          </SECID>
          <SECNAME>MHO M/I HOMES INC</SECNAME>
          <TICKER>MHO</TICKER>
          <FIID>9594</FIID>
        </SECINFO>
      </STOCKINFO>
      <STOCKINFO>
        <SECINFO>
          <SECID>
            <UNIQUEID>607828100</UNIQUEID>
            <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
          </SECID>
          <SECNAME>MOD MODINE MANUFACTURING CO</SECNAME>
          <TICKER>MOD</TICKER>
          <FIID>271952</FIID>
        </SECINFO>
      </STOCKINFO>
      <STOCKINFO>
        <SECINFO>
          <SECID>
            <UNIQUEID>594918104</UNIQUEID>
            <UNIQUEIDTYPE>CUSIP</UNIQUEIDTYPE>
          </SECID>
          <SECNAME>MSFT MICROSOFT CORP</SECNAME>
          <TICKER>MSFT</TICKER>
          <FIID>272093</FIID>
        </SECINFO>
      </STOCKINFO>
    </SECLIST>
  </SECLISTMSGSRSV1>
</OFX>
`

interface Transaction {
  id: string
  type: string
  date: Date
  ticker: string
  shares: number
  price: number
  commision: number

  spendUah: number
  valueUah: number
  incomeUah: number
  taxUah: number
  netIncomeUah: number
  exchangeRate: number
  currentPrice: number
}

export function parseOfx(text: string): Transaction[] {
  const xml = new DOMParser().parseFromString('<OFX>' + text.split('<OFX>').pop(), 'text/xml')

  const tickers = []
  for (const secinfo of Array.from(xml.querySelectorAll('SECLIST STOCKINFO'))) {
    tickers.push({
      id: secinfo.querySelector('SECID UNIQUEID')?.textContent,
      type: secinfo.querySelector('SECID UNIQUEIDTYPE')?.textContent,
      name: secinfo.querySelector('SECNAME')?.textContent,
      ticker: secinfo.querySelector('TICKER')?.textContent,
      fiid: secinfo.querySelector('FIID')?.textContent,
    })
  }

  const transactions: Transaction[] = []
  for (const transaction of Array.from(xml.querySelectorAll('INVSTMTRS INVTRANLIST BUYSTOCK, INVSTMTRS INVTRANLIST SELLSTOCK'))) {
    transactions.push({
      id: transaction.querySelector('FITID')?.textContent || '',
      type: transaction.querySelector('BUYTYPE, SELLTYPE')?.textContent || '',
      date: new Date(
        transaction
          .querySelector('DTTRADE')
          ?.textContent?.substring(0, 8)
          ?.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''
      ),
      ticker: tickers.find((t) => t.id === transaction.querySelector('SECID UNIQUEID')?.textContent)?.ticker || '',
      shares: parseFloat(transaction.querySelector('UNITS')?.textContent || ''),
      price: parseFloat(transaction.querySelector('UNITPRICE')?.textContent || ''),
      commision: parseFloat(transaction.querySelector('COMMISSION')?.textContent || ''),

      spendUah: 0,
      valueUah: 0,
      incomeUah: 0,
      taxUah: 0,
      netIncomeUah: 0,
      exchangeRate: 0,
      currentPrice: 0,
    })
  }

  // console.table(transactions)
  return transactions
}

const Orders = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentExchangeRate, setCurrentExchangeRate] = useState(0)

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'BUY')
      .map((transaction): Transaction => {
        const spendUah = transaction.shares * transaction.price * transaction.exchangeRate
        const valueUah = transaction.shares * transaction.currentPrice * currentExchangeRate
        const incomeUah = valueUah - spendUah
        const taxUah = incomeUah > 0 ? incomeUah * 0.195 : 0
        const netIncomeUah = incomeUah - taxUah
        return {
          ...transaction,
          spendUah,
          valueUah,
          incomeUah,
          taxUah,
          netIncomeUah,
        }
      })
  }, [transactions, currentExchangeRate])

  useEffect(() => {
    getExchangeRate(new Date()).then(setCurrentExchangeRate)
  }, [])

  const negative = useMemo(() => filtered.find((t) => t.netIncomeUah < 0), [filtered])

  const handle = (text: string) => {
    const transactions = parseOfx(text)
    setTransactions(transactions)

    for (const date of Array.from(new Set(transactions.map((t) => t.date)))) {
      getExchangeRate(date).then((exchangeRate) => {
        const next = [...transactions]
        next.forEach((t) => {
          if (t.date == date) {
            t.exchangeRate = exchangeRate
          }
          return t
        })
        setTransactions(next)
      })
    }

    for (const ticker of Array.from(new Set(transactions.map((t) => t.ticker)))) {
      getPrice(ticker).then((price) => {
        const next = [...transactions]
        next.forEach((t) => {
          if (t.ticker == ticker && price) {
            t.currentPrice = price
          }
          return t
        })
        setTransactions(next)
      })
    }
  }

  const handleFileChoosen = async (file: File) => {
    const text = await file.text()
    handle(text)
  }

  useEffect(() => {
    handle(sample)
  }, [])

  return (
    <main>
      <Hero title="Курсові різниці" subtitle="Розрахунок фінансових результатів з виписки Interactive Brokers" />

      <div className="container py-5">
        <p>Мета цього звіту &mdash; подивитися на свої активи в розрізі курсових різниць.</p>
        <p>Адже можлива ситуація коли ми матимемо збиток у долларах, але після перерахунку у гривні - буде плюс, який повинен бути оподаткованим.</p>
      </div>

      <div className="container pb-5">
        <div className="row">
          <p className="col-12 col-sm-6">
            <label htmlFor="ofx" className="form-label">
              Звіт MS Money{' '}
              <a href="sample.ofx" download>
                приклад
              </a>
            </label>
            <input id="ofx" className="form-control" type="file" accept=".ofx" onChange={(e) => handleFileChoosen(e.target.files![0])} />
          </p>
        </div>
        <details>
          <summary>Покрокова інструкція &mdash; як сформувати звіт</summary>
          <p>
            Переходимо на сторінку <b>Statements</b> розділу <b>Performance & Reports</b>
          </p>
          <p>
            <img src={statements} style={{ maxWidth: '50vw' }} />
          </p>
          <p>
            Зправа, знизу, буде кнопка для формування звіту <b>MS Money</b>
          </p>
          <p>
            <img src={msmoney} style={{ maxWidth: '50vw' }} />
          </p>
          <p>Зʼявиться віконце для вибору дат, за якими буде сформовано звіт. Виберіть, приблизні, дати коли ви купляли будь які акції</p>
          <p>
            <img src={popup} style={{ maxWidth: '50vw' }} />
          </p>
        </details>
      </div>
      {transactions.length > 0 && (
        <div className="container-fluid px-0">
          <table className="table table-striped table-sm mb-0">
            <thead className="table-primary" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th className="fw-normal">Дата</th>
                <th className="fw-normal">Тікер</th>
                <th className="fw-normal">Кількість</th>
                <th className="fw-normal">
                  Ціна покупки <span className="opacity-50">$</span>
                </th>
                <th className="fw-normal">
                  Поточна ціна <span className="opacity-50">$</span>
                </th>
                <th className="fw-normal">
                  Комісія <span className="opacity-50">$</span>
                </th>
                <th className="fw-normal">
                  Курс <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">
                  Інвестовано <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">
                  Поточна вартість <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">
                  Фін. результат брутто <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">Податок</th>
                <th className="fw-normal">
                  Фін. результат нетто <span className="opacity-50">грн</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.date.toISOString().split('T').shift()}</td>
                  <td>{t.ticker}</td>
                  <td>{t.shares}</td>
                  <td>{currency(t.price)}</td>
                  <td>{currency(t.currentPrice)}</td>
                  <td>{currency(t.commision)}</td>
                  <td>{currency(t.exchangeRate)}</td>
                  <td>{currency(t.spendUah)}</td>
                  <td>{currency(t.valueUah)}</td>
                  <td className={t.incomeUah < 0 ? 'text-danger' : ''}>{currency(t.incomeUah)}</td>
                  <td>{currency(t.taxUah)}</td>
                  <td className={t.netIncomeUah < 0 ? 'text-danger' : ''}>{currency(t.netIncomeUah)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="container py-5">
        {negative && (
          <p>
            Так наприклад {negative.ticker} куплений {negative.date.toISOString().split('T').shift()} на разі має негативний результат{' '}
            <span className="text-danger">{currency(negative.netIncomeUah)} грн</span>, навіть з урахуванням курсових різниць.
          </p>
        )}
      </div>

      <ExchangeRateDifferencesLinks />
      <Subscribe />
      <Join />
    </main>
  )
}

export default Orders

export const Head: HeadFC = () => <title>Розрахунок поточних фінансових результатів з виписки Interactive Brokers</title>
