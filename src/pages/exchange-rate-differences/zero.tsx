import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC, Link, navigate } from 'gatsby'
import { currency, round } from '../../utils/formatters'
import { getExchangeRate } from '../../utils/exchange-rate'
import { getPrice } from '../../utils/yahoo'
import Join from '../../components/join'
import { Header } from '../../components/header'
import { useAuth } from '../../context/auth'

/**
 * Guard against unexpected NaN values
 * @param value input number value
 * @param fallback fallback to use in cases of NaN
 */
function guardNaN(value: number, fallback = 0): number {
  return isNaN(value) ? fallback : value
}

const Zero = () => {
  const { user } = useAuth()
  useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=' + window.location.pathname)
    }
  }, [user])

  const tax = 23 //19.5
  const [symbol, setSymbol] = useState('AAPL')
  const [date, setDate] = useState(new Date('2020-03-20'))
  const [price, setPrice] = useState(0)
  const [commission, setCommission] = useState(0)
  const [shares, setShares] = useState(10)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [previousPrice, setPreviousPrice] = useState(0)
  const [previousExchangeRate, setPreviousExchangeRate] = useState(0)
  const [currentExchangeRate, setCurrentExchangeRate] = useState(0)
  const [testExchangeRate, setTestExchangeRate] = useState(0)
  const [testPrice, setTestPrice] = useState(0)

  const days = useMemo(() => Math.round((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24)), [date])
  const spendUsd = useMemo(() => guardNaN(shares * previousPrice + commission), [shares, previousPrice, commission])
  const spendUah = useMemo(() => guardNaN(spendUsd * previousExchangeRate), [spendUsd, previousExchangeRate])
  const valueUsd = useMemo(() => guardNaN(shares * currentPrice - commission), [shares, currentPrice, commission])
  const valueUah = useMemo(() => guardNaN(valueUsd * currentExchangeRate), [valueUsd, currentExchangeRate])
  const incomeUsd = useMemo(() => guardNaN(valueUsd - spendUsd), [valueUsd, spendUsd])
  const incomeUah = useMemo(() => guardNaN(valueUah - spendUah), [valueUah, spendUah])
  const exchangeRateDifferenceUah = useMemo(() => guardNaN(spendUsd * (currentExchangeRate - previousExchangeRate)), [spendUsd, currentExchangeRate, previousExchangeRate])
  const exchangeRateDifferenceUsd = useMemo(() => guardNaN(exchangeRateDifferenceUah / currentExchangeRate), [exchangeRateDifferenceUah, currentExchangeRate])
  const taxUah = useMemo(() => guardNaN(incomeUah > 0 ? incomeUah * (tax / 100) : 0), [incomeUah, tax])
  const taxUsd = useMemo(() => guardNaN(taxUah / currentExchangeRate), [taxUah, currentExchangeRate])
  const taxUah2 = useMemo(() => guardNaN(taxUah === 0 ? 0 : exchangeRateDifferenceUah * (tax / 100)), [taxUah, exchangeRateDifferenceUah, tax])
  const taxUsd2 = useMemo(() => guardNaN(taxUah2 / currentExchangeRate), [taxUah2, currentExchangeRate])

  const criticalExchangeRate = useMemo(() => {
    const result = spendUah / valueUsd
    if (testExchangeRate === 0 && !isNaN(result) && result) {
      setTestExchangeRate(result)
    }
    return isNaN(result) ? 0 : result
  }, [spendUah, valueUsd])

  const criticalPrice = useMemo(() => {
    const result = spendUah / currentExchangeRate / shares
    if (testPrice === 0 && !isNaN(result) && result) {
      setTestPrice(result)
    }
    return isNaN(result) ? 0 : result
  }, [spendUah, currentExchangeRate, shares])

  const isCalculateDisabled = useMemo(() => {
    if (!symbol || !date || !shares) {
      return true
    }
    if (shares < 1) {
      return true
    }
    // if (isNaN(new Date(date))) {
    //   return true
    // }
    return false
  }, [symbol, date, shares])

  const calculate = async () => {
    const previousPrice = price ? price : await getPrice(symbol, date)
    if (!previousPrice) {
      alert(`Нажаль не вдалося визначити вартість акції ${symbol} на дату ${date.toISOString().substring(0, 10)}, спробуйте інший тікер або дату.`)
      return
    }
    setPreviousPrice(previousPrice)

    const currentPrice = await getPrice(symbol)
    if (!currentPrice) {
      alert(`Нажаль не вдалося визначити поточну вартість акції ${symbol}, спробуйте інший тікер.`)
      return
    }
    setCurrentPrice(currentPrice)

    const previousExchangeRate = await getExchangeRate(date)
    if (!previousExchangeRate) {
      alert(`Нажаль не вдалося визначити курс валюти на дату ${date.toISOString().substring(0, 10)}, спробуйте пізніше.`)
      return
    }
    setPreviousExchangeRate(previousExchangeRate)

    const currentExchangeRate = await getExchangeRate(new Date())
    if (!currentExchangeRate) {
      alert(`Нажаль не вдалося визначити поточний курс валюти, спробуйте пізніше.`)
      return
    }
    setCurrentExchangeRate(currentExchangeRate)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    calculate()
  }, [])

  return (
    <main>
      {/* <Hero title="Курсові різниці" subtitle="Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці" /> */}
      <Header />

      <div className="container mx-auto my-0 p-4">
        <div className="grid grid-cols-6 gap-4 my-5">
          <p>
            <label className="block mb-2">Дата купівлі</label>
            <input type="date" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={date.toISOString().substring(0, 10)} onChange={(e) => setDate(e.target.valueAsDate || new Date())} />
          </p>

          <p>
            <label className="block mb-2">Тікер</label>
            <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </p>

          <p>
            <label className="block mb-2">Кількість</label>
            <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" min="1" max="999" value={shares} onChange={(e) => setShares(e.target.valueAsNumber)} />
          </p>

          <p title="Якщо залишити пустим, або нуль, буде використана вартість акції на дату покупки за данними Yahoo Finance">
            <label className="block mb-2">Ціна купівлі*</label>
            <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" min="0" max="999" value={price} onChange={(e) => setPrice(e.target.valueAsNumber)} />
          </p>

          <p title="Опціонально, сума яку утримує брокер при купівлі чи продажу, якщо буде вказано то врахується двічі. В залежності від типу аккаунту в IB має бути або 1.0, або 0.33. Якщо аккаунт старий, за часів ArtCaptial то може бути 1.5.">
            <label className="block mb-2">Комісія*</label>
            <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" min="0" max="999" value={commission} onChange={(e) => setCommission(e.target.valueAsNumber)} />
          </p>

          <p>
            <label htmlFor="btnCalculate" className="block mb-2">
              &nbsp;
            </label>
            <button id="btnCalculate" className="block w-full px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" onClick={() => calculate()} disabled={isCalculateDisabled}>
              Порахувати
            </button>
          </p>
        </div>

        <table className="table-auto w-full my-5">
          <thead>
            <tr>
              <th className='p-2 text-left'>Показник</th>
              <th className='p-2 text-left'>У валюті</th>
              <th className='p-2 text-left'>У гривні</th>
              <th className='p-2 text-left'>У валюті %, річних</th>
              <th className='p-2 text-left'>У гривні %, річних</th>
            </tr>
          </thead>
          <tbody>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left'>Фін.результат, брутто</th>
              <td className='p-2' title={`Фін. результат, брутто, у валюті\n\nincomeUsd = valueUsd - spendUsd = ${currency(valueUsd)} - ${currency(spendUsd)} = ${currency(incomeUsd)}`}>{currency(incomeUsd)}</td>
              <td className='p-2' title={`Фін. результат, брутто, у гривні\n\nincomeUah = valueUah - spendUah = ${currency(valueUah)} - ${currency(spendUah)} = ${currency(incomeUah)}`}>{currency(incomeUah)}</td>
              <td className='p-2'
                title={`Фін. результат, у валюті %, річних\n\npct = incomeUsd / spendUsd / days * 365 = ${currency(incomeUsd)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  (incomeUsd / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round((incomeUsd / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td className='p-2'
                title={`Фін. результат, у гривні %, річних\n\npct = incomeUah / spendUah / days * 365 = ${currency(incomeUah)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  (incomeUah / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round((incomeUah / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left font-normal'>у т.ч. курсові різниці</th>
              <td className='p-2'
                title={`Фін. результат, брутто, у т.ч. курсові різниці, у валюті\n\nexchangeRateDifferenceUsd = exchangeRateDifferenceUah / currentExchangeRate = ${currency(
                  exchangeRateDifferenceUah
                )} / ${currency(currentExchangeRate)} = ${currency(exchangeRateDifferenceUsd)}`}
              >
                {currency(exchangeRateDifferenceUsd)}
              </td>
              <td className='p-2'
                title={`Фін. результат, брутто, у т.ч. курсові різниці, у гривні\n\nexchangeRateDifferenceUah = spendUsd * (currentExchangeRate - previousExchangeRate) = ${currency(
                  spendUsd
                )} * (${currency(currentExchangeRate)} - ${currency(previousExchangeRate)}) = ${currency(exchangeRateDifferenceUah)}`}
              >
                {currency(exchangeRateDifferenceUah)}
              </td>
              <td className='p-2'
                title={`Фін. результат, у т.ч. курсові різниці, у валюті %, річних\n\npct = exchangeRateDifferenceUsd / spendUsd / days * 365 = ${currency(exchangeRateDifferenceUsd)} / ${currency(
                  spendUsd
                )} / ${days} * 365 = ${round((exchangeRateDifferenceUsd / spendUsd / days) * 365 * 100, 2)}`}
              >
                {round((exchangeRateDifferenceUsd / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td className='p-2'
                title={`Фін. результат, у т.ч. курсові різниці, у валюті %, річних\n\npct = exchangeRateDifferenceUah / spendUah / days * 365 = ${currency(exchangeRateDifferenceUah)} / ${currency(
                  spendUah
                )} / ${days} * 365 = ${round((exchangeRateDifferenceUah / spendUah / days) * 365 * 100, 2)}`}
              >
                {round((exchangeRateDifferenceUah / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left'>Податки: ПДФО 18% + ВЗ 5%</th>
              <td className='p-2' title={`Податки у валюті, від гривні\n\ntaxUsd = taxUah / currentExchangeRate = ${currency(taxUah)} / ${currency(currentExchangeRate)} = ${currency(taxUsd)}`}>{currency(taxUsd)}</td>
              <td className='p-2' title={`Податки у гривні, до сплати\n\ntaxUah = incomeUah * (tax/100) = ${currency(incomeUah)} * (${tax}/100) = ${currency(taxUah)}`}>{currency(taxUah)}</td>
              <td className='p-2'
                title={`Податки, у валюті % річних\n\npct = taxUsd / spendUsd / days * 365 = ${currency(taxUsd)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  (taxUsd / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUsd / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td className='p-2'
                title={`Податки, у гривні % річних\n\npct = taxUah / spendUah / days * 365 = ${currency(taxUah)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  (taxUah / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUah / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left font-normal'>у т.ч. з курсових різниць</th>
              <td className='p-2' title={`Податки, у т.ч. з курсових різниць\n\ntaxUsd2 = taxUah2 / currentExchangeRate = ${currency(taxUah2)} / ${currency(currentExchangeRate)} = ${currency(taxUsd2)}`}>
                {currency(taxUsd2)}
              </td>
              <td className='p-2' title={`Податки, у т.ч. з курсових різниць\n\ntaxUah2 = exchangeRateDifferenceUah * (tax / 100) = ${currency(exchangeRateDifferenceUah)} * (${tax} / 100) = ${currency(taxUah2)}`}>
                {currency(taxUah2)}
              </td>
              <td className='p-2'
                title={`Податки, у т.ч. з курсових різниц, у валюті %, річних\n\npct = taxUsd2 / spendUsd / days * 365 = ${currency(taxUsd2)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  (taxUsd2 / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUsd2 / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td className='p-2'
                title={`Податки, у т.ч. з курсових різниц, у гривні %, річних\n\npct = taxUah2 / spendUah / days * 365 = ${currency(taxUah2)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  (taxUah2 / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUah2 / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left'>Фін.результат, нетто</th>
              <td className='p-2' title={`Фін. результат, нетто, у валюті\n\nnetIncomeUsd = incomeUsd - taxUsd = ${currency(incomeUsd)} - ${currency(taxUsd)} = ${currency(incomeUsd - taxUsd)}`}>
                {currency(incomeUsd - taxUsd)}
              </td>
              <td className='p-2' title={`Фін. результат, нетто, у гривні\n\nnetIncomeUah = incomeUah - taxUah = ${currency(incomeUah)} - ${currency(taxUah)} = ${currency(incomeUah - taxUah)}`}>
                {currency(incomeUah - taxUah)}
              </td>
              <td className='p-2'
                title={`Фін. результат, нетто, у валюті %, річних\n\npct = netIncomeUsd / spendUsd / days * 365 = ${currency(incomeUsd - taxUsd)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  ((incomeUsd - taxUsd) / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round(((incomeUsd - taxUsd) / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td className='p-2'
                title={`Фін. результат, нетто, у гривні %, річних\n\npct = netIncomeUah / spendUah / days * 365 = ${currency(incomeUah - taxUah)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  ((incomeUah - taxUah) / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round(((incomeUah - taxUah) / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
          </tbody>
        </table>

        <p className='mt-5'>Курс валюти при якому фін. результат інвестицій буде нульовим при поточній ціні складає: <b>{currency(criticalExchangeRate)} грн</b></p>
        <p>Поточна ціна акції при котрій фін. результат був би нульовим: <b>${currency(criticalPrice)}</b></p>

      </div>

      <Join />
    </main>
  )
}

export default Zero

export const Head: HeadFC = () => <title>Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці</title>
