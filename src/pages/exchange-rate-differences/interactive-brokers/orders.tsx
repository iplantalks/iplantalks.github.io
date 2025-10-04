import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC, navigate } from 'gatsby'
import { currency } from '../../../utils/formatters'
import { getExchangeRate } from '../../../utils/exchange-rate'
import { getPrice } from '../../../utils/yahoo'
import statements from '../../../images/exchange-rate-differences/statements.png'
import popup from '../../../images/exchange-rate-differences/popup.png'
import Join from '../../../components/join'
import { OFX, parseMsMoneyOfxReport } from '../../../utils/ibkr/ofx'
import { Header } from '../../../components/header'
import { useAuth } from '../../../context/auth'

interface Transaction {
  id: string
  type: string
  date: Date
  ticker: string
  shares: number
  price: number
  commision: number
  currency: string

  spendUah: number
  valueUah: number
  incomeUah: number
  taxUah: number
  taxUsd: number
  netIncomeUah: number
  netIncomeUsd: number
  exchangeRate: number
  currentPrice: number

  sharesOriginal: number

  reportedPrice: number
}

const Orders = () => {
  const { user } = useAuth()
  useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=' + window.location.pathname)
    }
  }, [user])

  const [messages, setMessages] = useState<string[]>([])
  const appendMessage = (message: string) => setMessages((prev) => [...prev, message])
  const [ofx, setOfx] = useState<OFX>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentExchangeRate, setCurrentExchangeRate] = useState(0)

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'BUY')
      .map((transaction): Transaction => {
        const spendUah = transaction.shares * transaction.price * transaction.exchangeRate
        const valueUah = transaction.shares * transaction.currentPrice * currentExchangeRate
        const incomeUah = valueUah - spendUah
        const taxUah = incomeUah > 0 ? incomeUah * 0.23 : 0
        const taxUsd = taxUah / currentExchangeRate
        const netIncomeUah = incomeUah - taxUah
        const netIncomeUsd = transaction.currentPrice * transaction.shares - transaction.price * transaction.shares - taxUsd - transaction.commision * 2 // (текущая_цена_usd*quantity - цена_покупки_usd*quantity) - налог_в_валюте - комисия*2
        return {
          ...transaction,
          spendUah,
          valueUah,
          incomeUah,
          taxUah,
          taxUsd,
          netIncomeUah,
          netIncomeUsd,
        }
      })
      .filter((t) => t.currentPrice)
  }, [transactions, currentExchangeRate])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    getExchangeRate(new Date()).then((exchangeRate) => {
      appendMessage(`Курс на сьогодні: ${exchangeRate}`)
      setCurrentExchangeRate(exchangeRate)
    })
  }, [])

  const negative = useMemo(() => filtered.find((t) => t.netIncomeUah < 0), [filtered])

  const handle = (ofx: OFX /*text: string*/) => {
    // const ofx = parseMsMoneyOfxReport(text)
    appendMessage(`Звіт зчитано, знайдено ${ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.length} покупок`)
    setOfx(ofx)

    const transactions: Transaction[] =
      ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.map((t) => ({
        id: t.INVBUY.INVTRAN.FITID || '',
        type: t.BUYTYPE || '',
        date: new Date(t.INVBUY.INVTRAN.DTTRADE?.substring(0, 8)?.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''),
        ticker:
          ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.find((s) => t.INVBUY.SECID.UNIQUEID === s.SECINFO.SECID.UNIQUEID && t.INVBUY.SECID.UNIQUEIDTYPE === s.SECINFO.SECID.UNIQUEIDTYPE)?.SECINFO?.TICKER ||
          '',
        shares: t.INVBUY.UNITS || 0,
        price: t.INVBUY.UNITPRICE, // parseFloat(transaction.querySelector('UNITPRICE')?.textContent || ''),
        commision: t.INVBUY.COMMISSION || 0, // parseFloat(transaction.querySelector('COMMISSION')?.textContent || ''),

        currency: t.INVBUY.CURRENCY?.CURSYM || 'USD',

        spendUah: 0,
        valueUah: 0,
        incomeUah: 0,
        incomeUsd: 0,
        taxUah: 0,
        taxUsd: 0,
        netIncomeUah: 0,
        netIncomeUsd: 0,
        exchangeRate: 0,
        currentPrice: 0,

        sharesOriginal: t.INVBUY.UNITS || 0,

        reportedPrice:
          ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST?.POSSTOCK?.find(
            (r) => r.INVPOS.SECID.UNIQUEID === t.INVBUY.SECID.UNIQUEID && r.INVPOS.SECID.UNIQUEIDTYPE === t.INVBUY.SECID.UNIQUEIDTYPE
          )?.INVPOS.UNITPRICE || 0,
      })) || []
    setTransactions(transactions)

    for (const date of Array.from(new Set(transactions.map((t) => t.date)))) {
      getExchangeRate(date)
        .then((exchangeRate) => {
          const next = [...transactions]
          next.forEach((t) => {
            if (t.date == date) {
              t.exchangeRate = exchangeRate
            }
            return t
          })
          appendMessage(`✅ Курс на ${date.toISOString().split('T').shift()}: ${exchangeRate}`)
          setTransactions(next)
        })
        .catch((error) => {
          appendMessage(`❌ Помилка отримання курсу на ${date.toISOString().split('T').shift()}: ${error.message || error}`)
        })
    }

    for (const ticker of Array.from(new Set(transactions.map((t) => t.ticker)))) {
      if (ticker.includes(' ')) {
        appendMessage(`⚠️ Тікер ${ticker} містить пробіл, міняємо на дефіс для Yahoo Finance`)
      }
      getPrice(ticker.replace(' ', '-'))
        .then((price) => {
          const next = [...transactions]
          next.forEach((t) => {
            if (t.ticker == ticker /* && price */) {
              t.currentPrice = price ?? t.reportedPrice
            }
            return t
          })
          appendMessage(`✅ Ціна ${ticker} на сьогодні: ${price}`)
          setTransactions(next)
        })
        .catch((error) => {
          appendMessage(`❌ Помилка отримання ціни ${ticker}: ${error.message || error}`)
        })
    }
  }

  const handleFileChoosen = async (files: FileList | null) => {
    if (!files) {
      return
    }
    const reports: OFX[] = []
    for (const file of Array.from(files)) {
      const text = await file.text()
      const report = parseMsMoneyOfxReport(text)
      reports.push(report)
    }

    const ofx = reports.reduce(
      (result, ofx) => {
        if (!result) {
          return ofx
        }
        result.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.push(...(ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK || []))
        for (const stock of ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO || []) {
          if (!result.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.find((s) => s.SECINFO.SECID.UNIQUEID === stock.SECINFO.SECID.UNIQUEID && s.SECINFO.SECID.UNIQUEIDTYPE === stock.SECINFO.SECID.UNIQUEIDTYPE)) {
            result.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.push(stock)
          }
        }
        return result
      },
      {
        INVSTMTMSGSRSV1: {
          INVSTMTTRNRS: {
            INVSTMTRS: {
              INVTRANLIST: {
                BUYSTOCK: [],
              },
              INVPOSLIST: {
                POSSTOCK: reports
                  .sort((a, b) => a.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.DTASOF.localeCompare(b.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.DTASOF))
                  .map((r) => r.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST?.POSSTOCK || [])
                  .shift(),
              },
            },
          },
        },
        SECLISTMSGSRSV1: {
          SECLIST: {
            STOCKINFO: [],
          },
        },
      } as unknown as OFX
    )

    handle(ofx)
  }

  useEffect(() => {
    fetch('/exchange-rate-differences/interactive-brokers/orders/sample.ofx')
      .then((res) => res.text())
      .then((text) => parseMsMoneyOfxReport(text))
      .then(handle)
    //.then(handle)
  }, [])

  return (
    <main>
      <Header />
      {/* <Hero title="Курсові різниці" subtitle="Розрахунок фінансових результатів з виписки Interactive Brokers" /> */}

      <div className="container mx-auto my-5 p-4">
        <p className='mb-2'>Мета цього звіту &mdash; подивитися на свої активи в розрізі курсових різниць.</p>
        <p className='mb-2'>Адже можлива ситуація коли ми матимемо збиток у доларах, але після перерахунку у гривні - буде плюс, який повинен бути оподаткованим.</p>

        <div className="my-5">
          <label htmlFor="ofx" className="block mb-2">Звіт MS Money <a href="sample.ofx" download>приклад</a></label>
          <input id="ofx" className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" type="file" accept=".ofx" multiple={true} onChange={(e) => handleFileChoosen(e.target.files)} />
        </div>

        <p className='text-neutral-500'>Примітка: IBKR не дозволяє сформувати звіт за період більший ніж рік - якщо у вас є покупки в різні роки - просто сформуйте декілька звітів та загрузіть їх усі одразу</p>
        <details className="my-3">
          <summary>Покрокова інструкція &mdash; як сформувати звіт</summary>
          <p className='mb-2'>
            Переходимо на сторінку <b>Third-Party Reports</b> розділу <b>Performance & Reports</b>
          </p>
          <p className='mb-2'>
            <img src={statements} style={{ maxWidth: '50vw' }} />
          </p>
          <p className='mb-2'>
            Знизу, буде блок <b>Third-Party Downloads</b> для формування звіту
          </p>
          <p className='mb-2'>
            Виберіть <b>Custom Date Range</b> та дати, за якими буде сформовано звіт. Виберіть, приблизні, дати коли ви купляли будь які акції
          </p>
          <p className='mb-2'>
            <img src={popup} style={{ maxWidth: '50vw' }} />
          </p>
          <p className='mb-2'>
            <b>Provider - MS Money</b> - MS Money - один з розповсюджених форматів обміну фінансовою інформацією Open Finance Exchange (ofx), є нічим іншим як звичайний XML файлик з транзакціями за
            період, отже його можна відкрити в блокноті та подивитися, що там в середині. Ця сторінка просто "візуалізує" його. Причина чому вибрали MS Money - задля того, щоб не зійти з розуму,
            намагаючись зрозуміти як сформувати кастомний Flex звіт.
          </p>
        </details>
      </div>


      <div className="container mx-auto my-5 p-4">
        {transactions.length > 0 && (
          <table className="table-auto w-full border-collapse">
            <thead className='sticky top-0'>
              <tr className="bg-black text-sm text-white">
                <th className="font-normal">
                  Дата
                  <br />
                  <span className="opacity-50">купівлі</span>
                </th>
                <th className="font-normal">
                  Тікер
                  <br />
                  <span className="opacity-50">&nbsp;</span>
                </th>
                <th className="font-normal">
                  Кількість
                  <br />
                  <span className="opacity-50">шт</span>
                </th>
                <th className="font-normal">
                  Валюта
                  <br />
                  <span className="opacity-50">од. валюти</span>
                </th>
                <th className="font-normal">
                  Ціна покупки
                  <br />
                  <span className="opacity-50">од. валюти</span>
                </th>
                <th className="font-normal">
                  Поточна ціна
                  <br />
                  <span className="opacity-50">од. валюти</span>
                </th>
                <th className="font-normal">
                  Комісія
                  <br />
                  <span className="opacity-50">од. валюти</span>
                </th>
                {/* <th className="font-normal">
                  Фін. результат брутто
                  <br />
                  <span className="opacity-50">грн</span>
                </th> */}
                <th className="font-normal">
                  Податок
                  <br />
                  <span className="opacity-50">од. валюти</span>
                </th>
                {/* <th className="font-normal">
                  Фін. результат нетто
                  <br />
                  <span className="opacity-50">грн</span>
                </th> */}
                <th className="font-normal">
                  Фін. результат нетто
                  <br />
                  <span className="opacity-50">од. валюти</span>
                </th>
                <th className="font-normal">
                  Фін. результат нетто
                  <br />
                  <span className="opacity-50">%</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {filtered.map((t) => (
                <tr className='border-t border-neutral-200' key={t.id}>
                  <td className='p-2'>{t.date.toISOString().split('T').shift()}</td>
                  <td className='p-2'>{t.ticker}</td>
                  <td className='p-2'>
                    <input
                      className='block w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition'
                      type="number"
                      min="0"
                      max={t.sharesOriginal}
                      step="1"
                      value={t.shares}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((x) =>
                            x.id === t.id ? { ...x, shares: e.target.valueAsNumber > t.sharesOriginal ? t.sharesOriginal : e.target.valueAsNumber < 0 ? 0 : e.target.valueAsNumber } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className='p-2'>{t.currency}</td>
                  <td className='p-2' title={`${currency(t.exchangeRate * t.price)}грн`}>{currency(t.price)}</td>
                  <td className='p-2' title={`${currency(currentExchangeRate * t.currentPrice)}грн`}>{currency(t.currentPrice)}</td>
                  <td className="p-2">{currency(t.commision)}</td>
                  {/* <td className={t.incomeUah < 0 ? 'text-danger' : ''}>{currency(t.incomeUah)}</td> */}
                  <td className="p-2 bg-neutral-200" title={`${currency(t.taxUah)}грн`}>{currency(t.taxUsd)}</td>
                  {/* <td className={t.netIncomeUah < 0 ? 'text-danger' : ''}>{currency(t.netIncomeUah)}</td> */}
                  <td title={`${currency(t.netIncomeUah)}грн`} className={t.netIncomeUsd < 0 ? 'text-red-500 p-2' : 'p-2'}>{currency(t.netIncomeUsd)}</td>
                  <td className={t.netIncomeUsd < 0 ? 'text-red-500 p-2' : 'p-2'}>{currency((t.netIncomeUsd / (t.price * t.shares + t.taxUsd + t.commision * 2)) * 100)}</td>{' '}
                  {/*фин_результат_в_валюте/ (цена_покупки_usd*quantity+ налог_в_валюте + комисия*2)*/}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-100 border-t border-neutral-300">
              <tr>
                <td className='p-2' colSpan={7}>Разом</td>
                <td className="p-2 bg-neutral-200">{currency(filtered.map((f) => f.taxUsd).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2'>{currency(filtered.map((f) => f.netIncomeUsd).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2'></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>


      <div className="container mx-auto my-5 p-4">
        {negative && (
          <p className='mb-5'>
            Так наприклад {negative.ticker} куплений {negative.date.toISOString().split('T').shift()} на разі має негативний результат{' '}
            <span className="text-red-500">{currency(negative.netIncomeUah)} грн</span>, навіть з урахуванням курсових різниць.
          </p>
        )}
        <p className='my-5'>Важливо - цей калькулятор рахує курсові різниці для всіх активів куплених у звітний період без урахування продажів, комісій тощо, метою є саме розрахунок курсових різниць</p>

        <details className='my-5'>
          <summary>Деталі звіту</summary>
          <p className='mb-4'>Для перевірки розхідностей, ось деяка інформація, що зможе допомогти</p>
          <p className='mb-4'>Кількість тікерів у звіті: {ofx?.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.length || 0}</p>
          <p className='mb-4'>Кількість позицій у портфелі: {ofx?.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST?.POSSTOCK?.length || 0}</p>
          <p className='mb-4'>Кількість покупок: {ofx?.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.length || 0}</p>
          <p className='mb-4'>
            Для ще більших деталей ось усі покупки що є у звіті. Тут ідея така - якщо покупка є в середині звіту і не відображається у табличці - то це десь наш косяк і його можна і
            потрібно виправити, якщо ж покупки нема в самому звіті то і в табличці вона не зʼявиться і потрібно формувати інший звіт за інший період.
          </p>
          <details>
            <summary>Покупки</summary>
            <code className='text-xs p-2 block overflow-auto bg-neutral-100 border border-neutral-200 rounded'>
              <pre>{JSON.stringify(ofx?.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK, null, 4)}</pre>
            </code>
          </details>
        </details>

        {messages.length > 0 && (
          <details className='my-5'>
            <summary>Повідомлення</summary>
            <ul className='list-disc list-inside ml-5'>
              {messages.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <Join />
    </main>
  )
}

export default Orders

export const Head: HeadFC = () => <title>Розрахунок поточних фінансових результатів з виписки Interactive Brokers</title>
