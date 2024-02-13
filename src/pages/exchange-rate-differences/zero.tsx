import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC, Link } from 'gatsby'
import '../../styles/common.css'
import { currency, round } from '../../utils/formatters'
import { getExchangeRate } from '../../utils/exchange-rate'
import { getPrice } from '../../utils/yahoo'
import Join from '../../components/join'
import Hero from '../../components/hero'
import ExchangeRateDifferencesLinks from '../../components/exchange-rate-differences-links'
import Subscribe from '../../components/subscribe'

/**
 * Guard against unexpected NaN values
 * @param value input number value
 * @param fallback fallback to use in cases of NaN
 */
function guardNaN(value: number, fallback = 0): number {
  return isNaN(value) ? fallback : value
}

const Zero = () => {
  const tax = 19.5
  const [symbol, setSymbol] = useState('AAPL')
  const [date, setDate] = useState(new Date('2020-03-20'))
  const [shares, setShares] = useState(10)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [previousPrice, setPreviousPrice] = useState(0)
  const [previousExchangeRate, setPreviousExchangeRate] = useState(0)
  const [currentExchangeRate, setCurrentExchangeRate] = useState(0)
  const [testExchangeRate, setTestExchangeRate] = useState(0)
  const [testPrice, setTestPrice] = useState(0)

  const days = useMemo(() => Math.round((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24)), [date])
  const spendUsd = useMemo(() => guardNaN(shares * previousPrice), [shares, previousPrice])
  const spendUah = useMemo(() => guardNaN(spendUsd * previousExchangeRate), [spendUsd, previousExchangeRate])
  const valueUsd = useMemo(() => guardNaN(shares * currentPrice), [shares, currentPrice])
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
    const currentPrice = await getPrice(symbol)
    if (!currentPrice) {
      alert(`Нажаль не вдалося визначити поточну вартість акції ${symbol}, спробуйте інший тікер.`)
      return
    }
    setCurrentPrice(currentPrice)

    const previousPrice = await getPrice(symbol, date)
    if (!previousPrice) {
      alert(`Нажаль не вдалося визначити вартість акції ${symbol} на дату ${date.toISOString().substring(0, 10)}, спробуйте інший тікер або дату.`)
      return
    }
    setPreviousPrice(previousPrice)

    const currentExchangeRate = await getExchangeRate(new Date())
    if (!currentExchangeRate) {
      alert(`Нажаль не вдалося визначити поточний курс валюти, спробуйте пізніше.`)
      return
    }
    setCurrentExchangeRate(currentExchangeRate)

    const previousExchangeRate = await getExchangeRate(date)
    if (!previousExchangeRate) {
      alert(`Нажаль не вдалося визначити курс валюти на дату ${date.toISOString().substring(0, 10)}, спробуйте пізніше.`)
      return
    }
    setPreviousExchangeRate(previousExchangeRate)
  }

  useEffect(() => {
    calculate()
  }, [])

  return (
    <main>
      <Hero title="Курсові різниці" subtitle="Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці" />

      <div className="container py-5">
        <div className="row">
          <p className="col-12 col-sm-3">
            <label htmlFor="date" className="form-label">
              Дата купівлі
            </label>
            <input type="date" className="form-control" value={date.toISOString().substring(0, 10)} onChange={(e) => setDate(e.target.valueAsDate || new Date())} />
          </p>

          <p className="col-12 col-sm-3">
            <label htmlFor="date" className="form-label">
              Тікер
            </label>
            <input type="text" className="form-control" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </p>

          <p className="col-12 col-sm-3">
            <label htmlFor="date" className="form-label">
              Кількість
            </label>
            <input type="number" className="form-control" min="1" max="999" value={shares} onChange={(e) => setShares(e.target.valueAsNumber)} />
          </p>

          <p className="col-12 col-sm-3">
            <label htmlFor="btnCalculate" className="form-label d-block">
              &nbsp;
            </label>
            <button id="btnCalculate" className="btn btn-primary w-100" onClick={() => calculate()} disabled={isCalculateDisabled}>
              Порахувати
            </button>
          </p>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Показник</th>
              <th>У валюті</th>
              <th>У гривні</th>
              <th>У валюті %, річних</th>
              <th>У гривні %, річних</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Фін.результат, брутто</th>
              <td title={`Фін. результат, брутто, у валюті\n\nincomeUsd = valueUsd - spendUsd = ${currency(valueUsd)} - ${currency(spendUsd)} = ${currency(incomeUsd)}`}>{currency(incomeUsd)}</td>
              <td title={`Фін. результат, брутто, у гривні\n\nincomeUah = valueUah - spendUah = ${currency(valueUah)} - ${currency(spendUah)} = ${currency(incomeUah)}`}>{currency(incomeUah)}</td>
              <td
                title={`Фін. результат, у валюті %, річних\n\npct = incomeUsd / spendUsd / days * 365 = ${currency(incomeUsd)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  (incomeUsd / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round((incomeUsd / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td
                title={`Фін. результат, у гривні %, річних\n\npct = incomeUah / spendUah / days * 365 = ${currency(incomeUah)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  (incomeUah / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round((incomeUah / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr>
              <th className="fw-normal">у т.ч. курсові різниці</th>
              <td
                title={`Фін. результат, брутто, у т.ч. курсові різниці, у валюті\n\nexchangeRateDifferenceUsd = exchangeRateDifferenceUah / currentExchangeRate = ${currency(
                  exchangeRateDifferenceUah
                )} / ${currency(currentExchangeRate)} = ${currency(exchangeRateDifferenceUsd)}`}
              >
                {currency(exchangeRateDifferenceUsd)}
              </td>
              <td
                title={`Фін. результат, брутто, у т.ч. курсові різниці, у гривні\n\nexchangeRateDifferenceUah = spendUsd * (currentExchangeRate - previousExchangeRate) = ${currency(
                  spendUsd
                )} * (${currency(currentExchangeRate)} - ${currency(previousExchangeRate)}) = ${currency(exchangeRateDifferenceUah)}`}
              >
                {currency(exchangeRateDifferenceUah)}
              </td>
              <td
                title={`Фін. результат, у т.ч. курсові різниці, у валюті %, річних\n\npct = exchangeRateDifferenceUsd / spendUsd / days * 365 = ${currency(exchangeRateDifferenceUsd)} / ${currency(
                  spendUsd
                )} / ${days} * 365 = ${round((exchangeRateDifferenceUsd / spendUsd / days) * 365 * 100, 2)}`}
              >
                {round((exchangeRateDifferenceUsd / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td
                title={`Фін. результат, у т.ч. курсові різниці, у валюті %, річних\n\npct = exchangeRateDifferenceUah / spendUah / days * 365 = ${currency(exchangeRateDifferenceUah)} / ${currency(
                  spendUah
                )} / ${days} * 365 = ${round((exchangeRateDifferenceUah / spendUah / days) * 365 * 100, 2)}`}
              >
                {round((exchangeRateDifferenceUah / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr>
              <th>Податки: ПДФО 18% + ВЗ 1,5%</th>
              <td title={`Податки у валюті, від гривні\n\ntaxUsd = taxUah / currentExchangeRate = ${currency(taxUah)} / ${currency(currentExchangeRate)} = ${currency(taxUsd)}`}>{currency(taxUsd)}</td>
              <td title={`Податки у гривні, до сплати\n\ntaxUah = incomeUah * (tax/100) = ${currency(incomeUah)} * (${tax}/100) = ${currency(taxUah)}`}>{currency(taxUah)}</td>
              <td
                title={`Податки, у валюті % річних\n\npct = taxUsd / spendUsd / days * 365 = ${currency(taxUsd)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  (taxUsd / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUsd / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td
                title={`Податки, у гривні % річних\n\npct = taxUah / spendUah / days * 365 = ${currency(taxUah)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  (taxUah / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUah / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr>
              <th className="fw-normal">у т.ч. з курсових різниць</th>
              <td title={`Податки, у т.ч. з курсових різниць\n\ntaxUsd2 = taxUah2 / currentExchangeRate = ${currency(taxUah2)} / ${currency(currentExchangeRate)} = ${currency(taxUsd2)}`}>
                {currency(taxUsd2)}
              </td>
              <td title={`Податки, у т.ч. з курсових різниць\n\ntaxUah2 = exchangeRateDifferenceUah * (tax / 100) = ${currency(exchangeRateDifferenceUah)} * (${tax} / 100) = ${currency(taxUah2)}`}>
                {currency(taxUah2)}
              </td>
              <td
                title={`Податки, у т.ч. з курсових різниц, у валюті %, річних\n\npct = taxUsd2 / spendUsd / days * 365 = ${currency(taxUsd2)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  (taxUsd2 / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUsd2 / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td
                title={`Податки, у т.ч. з курсових різниц, у гривні %, річних\n\npct = taxUah2 / spendUah / days * 365 = ${currency(taxUah2)} / ${currency(spendUah)} / ${days} * 365 = ${round(
                  (taxUah2 / spendUah / days) * 365 * 100,
                  2
                )}`}
              >
                {round((taxUah2 / spendUah / days) * 365 * 100, 2)}%
              </td>
            </tr>
            <tr>
              <th>Фін.результат, нетто</th>
              <td title={`Фін. результат, нетто, у валюті\n\nnetIncomeUsd = incomeUsd - taxUsd = ${currency(incomeUsd)} - ${currency(taxUsd)} = ${currency(incomeUsd - taxUsd)}`}>
                {currency(incomeUsd - taxUsd)}
              </td>
              <td title={`Фін. результат, нетто, у гривні\n\nnetIncomeUah = incomeUah - taxUah = ${currency(incomeUah)} - ${currency(taxUah)} = ${currency(incomeUah - taxUah)}`}>
                {currency(incomeUah - taxUah)}
              </td>
              <td
                title={`Фін. результат, нетто, у валюті %, річних\n\npct = netIncomeUsd / spendUsd / days * 365 = ${currency(incomeUsd - taxUsd)} / ${currency(spendUsd)} / ${days} * 365 = ${round(
                  ((incomeUsd - taxUsd) / spendUsd / days) * 365 * 100,
                  2
                )}`}
              >
                {round(((incomeUsd - taxUsd) / spendUsd / days) * 365 * 100, 2)}%
              </td>
              <td
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

        <div>
          <details>
            <summary>
              Курс валюти при якому фін. результат інвестицій буде нульовим при поточній ціні складає: <b>{currency(criticalExchangeRate)} грн</b>
            </summary>
            <p>
              <label htmlFor="date" className="form-label">
                За для перевірки введіть критичний (
                <span className="text-primary-emphasis" onClick={() => setTestExchangeRate(parseFloat(currency(criticalExchangeRate)))}>
                  {currency(criticalExchangeRate)}
                </span>
                ), поточний (
                <span className="text-primary-emphasis" onClick={() => setTestExchangeRate(parseFloat(currency(currentExchangeRate)))}>
                  {currency(currentExchangeRate)}
                </span>
                ), або будь який інший курс валюти
              </label>
              <input type="number" className="form-control" value={testExchangeRate} onChange={(e) => setTestExchangeRate(e.target.valueAsNumber)} />
              <span className="form-text">
                Примітка: за для зручності, усі числові значення виводяться з вдома знаками після коми, із-за чого, розрахунковий результат буде близьким до нуля, але не нульовим, щоб отримати саме
                нуль введіть повне значення{' '}
                <span className="text-primary-emphasis" onClick={() => setTestExchangeRate(criticalExchangeRate)}>
                  {criticalExchangeRate}
                </span>
              </span>
            </p>
            <table className="table mx-3 my-3">
              <thead>
                <tr>
                  <th>Показник</th>
                  <th>Значення</th>
                  <th>Опис</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="fw-normal">spendUah</th>
                  <td>{currency(spendUah)}</td>
                  <td>
                    інвестовано грн
                    <br />
                    <code>
                      spendUah = shares * previousPrice * exchangeRate = {shares} * {currency(previousPrice)} * {currency(previousExchangeRate)} = {currency(spendUah)}
                    </code>
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">valueUah</th>
                  <td>{currency(shares * currentPrice * testExchangeRate)}</td>
                  <td>
                    Поточна вартість активу у гривні
                    <br />
                    <code>
                      valueUah = shares * currentPrice * testExchangeRate = {shares} * {currency(currentPrice)} * {currency(testExchangeRate)} = {currency(shares * currentPrice * testExchangeRate)}
                    </code>
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">incomeUah</th>
                  <td>{currency(shares * currentPrice * testExchangeRate - spendUah)}</td>
                  <td>
                    Прибуток, або збиток, фін. результат, у гривні
                    <br />
                    <code>
                      incomeUah = valueUah - spendUah = {currency(shares * currentPrice * testExchangeRate)} - {currency(spendUah)} = {currency(shares * currentPrice * testExchangeRate - spendUah)}
                    </code>
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">taxUah</th>
                  <td>{shares * currentPrice * testExchangeRate - spendUah > 0 ? currency((shares * currentPrice * testExchangeRate - spendUah) * (tax / 100)) : 0}</td>
                  <td>
                    Податок, ПДФО 18% + ВЗ 1,5%
                    <br />
                    {shares * currentPrice * testExchangeRate - spendUah > 0 && (
                      <code>
                        taxUah = incomeUah * (tax / 100) = {currency(shares * currentPrice * testExchangeRate - spendUah)} * ({tax}/100) ={' '}
                        {currency((shares * currentPrice * testExchangeRate - spendUah) * (tax / 100))}
                      </code>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">netIncomeUah</th>
                  <td>
                    {shares * currentPrice * testExchangeRate - spendUah > 0
                      ? currency(shares * currentPrice * testExchangeRate - spendUah - (shares * currentPrice * testExchangeRate - spendUah) * (tax / 100))
                      : 0}
                  </td>
                  <td>
                    Прибуток, чистими, після податків
                    <br />
                    {shares * currentPrice * testExchangeRate - spendUah > 0 && (
                      <code>
                        netIncomeUah = incomeUah - taxUah = {currency(shares * currentPrice * testExchangeRate - spendUah)} -{' '}
                        {shares * currentPrice * testExchangeRate - spendUah > 0 ? currency((shares * currentPrice * testExchangeRate - spendUah) * (tax / 100)) : 0} ={' '}
                        {shares * currentPrice * testExchangeRate - spendUah > 0
                          ? currency(shares * currentPrice * testExchangeRate - spendUah - (shares * currentPrice * testExchangeRate - spendUah) * (tax / 100))
                          : 0}
                      </code>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">criticalExchangeRate</th>
                  <td>{currency(criticalExchangeRate)}</td>
                  <td>
                    Курс валюти при якому фін. результат інвестицій буде нульовим
                    <br />
                    <code>
                      criticalExchangeRate = spendUah / valueUsd = {currency(spendUah)} - {currency(valueUsd)} = {currency(criticalExchangeRate)}
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </details>
        </div>

        <div>
          <details>
            <summary>
              Поточна ціна акції при котрій фін. результат був би нульовим: <b>${currency(criticalPrice)}</b>
            </summary>
            <p>
              <label htmlFor="date" className="form-label">
                За для перевірки введіть критичну (
                <span className="text-primary-emphasis" onClick={() => setTestPrice(parseFloat(currency(criticalPrice)))}>
                  {currency(criticalPrice)}
                </span>
                ), поточну (
                <span className="text-primary-emphasis" onClick={() => setTestPrice(parseFloat(currency(currentPrice)))}>
                  {currency(currentPrice)}
                </span>
                ), або будь яку іншу ціну акції
              </label>
              <input type="number" className="form-control" value={testPrice} onChange={(e) => setTestPrice(e.target.valueAsNumber)} />
              <span className="form-text">
                Примітка: за для зручності, усі числові значення виводяться з вдома знаками після коми, із-за чого, розрахунковий результат буде близьким до нуля, але не нульовим, щоб отримати саме
                нуль введіть повне значення{' '}
                <span className="text-primary-emphasis" onClick={() => setTestPrice(criticalPrice)}>
                  {criticalPrice}
                </span>
              </span>
            </p>
            <table className="table mx-3 my-3">
              <thead>
                <tr>
                  <th>Показник</th>
                  <th>Значення</th>
                  <th>Опис</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="fw-normal">spendUah</th>
                  <td>{currency(spendUah)}</td>
                  <td>
                    інвестовано грн
                    <br />
                    <code>
                      spendUah = shares * previousPrice * exchangeRate = {shares} * {currency(previousPrice)} * {currency(previousExchangeRate)} = {currency(spendUah)}
                    </code>
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">valueUah</th>
                  <td>{currency(shares * testPrice * currentExchangeRate)}</td>
                  <td>
                    Поточна вартість активу у гривні
                    <br />
                    <code>
                      valueUah = shares * testPrice * currentExchangeRate = {shares} * {currency(testPrice)} * {currency(currentExchangeRate)} = {currency(shares * testPrice * currentExchangeRate)}
                    </code>
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">incomeUah</th>
                  <td>{currency(shares * testPrice * currentExchangeRate - spendUah)}</td>
                  <td>
                    Прибуток, або збиток, фін. результат, у гривні
                    <br />
                    <code>
                      incomeUah = valueUah - spendUah = {currency(shares * testPrice * currentExchangeRate)} - {currency(spendUah)} = {currency(shares * testPrice * currentExchangeRate - spendUah)}
                    </code>
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">taxUah</th>
                  <td>{shares * testPrice * currentExchangeRate - spendUah > 0 ? currency((shares * testPrice * currentExchangeRate - spendUah) * (tax / 100)) : 0}</td>
                  <td>
                    Податок, ПДФО 18% + ВЗ 1,5%
                    <br />
                    {shares * testPrice * currentExchangeRate - spendUah > 0 && (
                      <code>
                        taxUah = incomeUah * (tax / 100) = {currency(shares * testPrice * currentExchangeRate - spendUah)} * ({tax}/100) ={' '}
                        {currency((shares * testPrice * currentExchangeRate - spendUah) * (tax / 100))}
                      </code>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">netIncomeUah</th>
                  <td>
                    {shares * testPrice * currentExchangeRate - spendUah > 0
                      ? currency(shares * testPrice * currentExchangeRate - spendUah - (shares * testPrice * currentExchangeRate - spendUah) * (tax / 100))
                      : 0}
                  </td>
                  <td>
                    Прибуток, чистими, після податків
                    <br />
                    {shares * testPrice * currentExchangeRate - spendUah > 0 && (
                      <code>
                        netIncomeUah = incomeUah - taxUah = {currency(shares * testPrice * currentExchangeRate - spendUah)} -{' '}
                        {shares * testPrice * currentExchangeRate - spendUah > 0 ? currency((shares * testPrice * currentExchangeRate - spendUah) * (tax / 100)) : 0} ={' '}
                        {shares * testPrice * currentExchangeRate - spendUah > 0
                          ? currency(shares * testPrice * currentExchangeRate - spendUah - (shares * testPrice * currentExchangeRate - spendUah) * (tax / 100))
                          : 0}
                      </code>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="fw-normal">criticalPrice</th>
                  <td>{currency(criticalPrice)}</td>
                  <td>
                    Поточна ціна акції при котрій фін. результат був би нульовим
                    <br />
                    <code>
                      criticalPrice = spendUah / currentExchangeRate / shares = {currency(spendUah)} / {currency(currentExchangeRate)} / {shares} = {currency(criticalPrice)}
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </details>
        </div>

        <div className="my-5">
          <p>Розрахунки</p>
          <table className="table">
            <thead>
              <tr>
                <th>Показник</th>
                <th>Значення</th>
                <th>Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="fw-normal">symbol</th>
                <td>{symbol}</td>
                <td>Тікер</td>
              </tr>
              <tr>
                <th className="fw-normal">date</th>
                <td>{date.toLocaleDateString()}</td>
                <td>Дата купівлі</td>
              </tr>
              <tr>
                <th className="fw-normal">days</th>
                <td>{days}</td>
                <td>Кількість днів з дати купівлі</td>
              </tr>
              <tr>
                <th className="fw-normal">shares</th>
                <td>{shares}</td>
                <td>Кількість куплених акцій</td>
              </tr>
              <tr>
                <th className="fw-normal">previousPrice</th>
                <td>{currency(previousPrice)}</td>
                <td>
                  Вартість однієї акціі {date.toLocaleDateString()}{' '}
                  <a href={'https://finance.yahoo.com/quote/' + symbol} target="_blank">
                    Yahoo Finance
                  </a>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">currentPrice</th>
                <td>{currency(currentPrice)}</td>
                <td>
                  Поточна вартість однієї акціі {symbol}{' '}
                  <a href={'https://finance.yahoo.com/quote/' + symbol} target="_blank">
                    Yahoo Finance
                  </a>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">previousExchangeRate</th>
                <td>{currency(previousExchangeRate)}</td>
                <td>
                  Курс{' '}
                  <a href="https://bank.gov.ua/ua/markets/exchangerates" target="_blank">
                    НБУ
                  </a>{' '}
                  на дату купівлі
                </td>
              </tr>
              <tr>
                <th className="fw-normal">currentExchangeRate</th>
                <td>{currency(currentExchangeRate)}</td>
                <td>
                  Поточний курс{' '}
                  <a href="https://bank.gov.ua/ua/markets/exchangerates" target="_blank">
                    НБУ
                  </a>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">spendUsd</th>
                <td>{currency(spendUsd)}</td>
                <td>
                  Інвестована сума у долларах
                  <br />
                  <code>
                    spendUsd = shares * previousPrice = {shares} * {currency(previousPrice)} = {currency(spendUsd)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">spendUah</th>
                <td>{currency(spendUah)}</td>
                <td>
                  Інвестована сума у гривні
                  <br />
                  <code>
                    spendUah = spendUsd * previousExchangeRate = {currency(spendUsd)} * {currency(previousExchangeRate)} = {currency(spendUah)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">valueUsd</th>
                <td>{currency(valueUsd)}</td>
                <td>
                  Поточна вартість активу у долларах
                  <br />
                  <code>
                    valueUsd = shares * currentPrice = {shares} * {currency(currentPrice)} = {currency(valueUsd)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">valueUah</th>
                <td>{currency(valueUah)}</td>
                <td>
                  Поточна вартість активу у гривні
                  <br />
                  <code>
                    valueUsd = valueUsd * currentExchangeRate = {currency(valueUsd)} * {currency(currentExchangeRate)} = {currency(valueUah)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">incomeUsd</th>
                <td>{currency(incomeUsd)}</td>
                <td>
                  Прибуток або збиток у долларах (фін. результат, брутто)
                  <br />
                  <code>
                    incomeUsd = valueUsd - spendUsd = {currency(valueUsd)} - {currency(spendUsd)} = {currency(incomeUsd)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">incomeUah</th>
                <td>{currency(incomeUah)}</td>
                <td>
                  Прибуток або збиток у гривні (фін. результат, брутто)
                  <br />
                  <code>
                    incomeUah = valueUah - spendUah = {currency(valueUah)} - {currency(spendUah)} = {currency(incomeUah)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">exchangeRateDifferenceUah</th>
                <td>{currency(exchangeRateDifferenceUah)}</td>
                <td>
                  Курсова різниця у гривні
                  <br />
                  <code>
                    exchangeRateDifferenceUah = spendUsd * (currentExchangeRate - previousExchangeRate) = {currency(spendUsd)} - ({currency(currentExchangeRate)} - {currency(previousExchangeRate)}) ={' '}
                    {currency(exchangeRateDifferenceUah)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">exchangeRateDifferenceUsd</th>
                <td>{currency(exchangeRateDifferenceUsd)}</td>
                <td>
                  Курсова різниця у валюті
                  <br />
                  <code>
                    exchangeRateDifferenceUsd = exchangeRateDifferenceUah / currentExchangeRate = {currency(exchangeRateDifferenceUah)} / {currency(currentExchangeRate)} ={' '}
                    {currency(exchangeRateDifferenceUsd)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">taxUah</th>
                <td>{currency(taxUah)}</td>
                <td>
                  Податки: ПДФО 18% + ВЗ 1,5%
                  <br />
                  <code>
                    taxUah = incomeUah * (tax / 100) = {currency(incomeUah)} * ({tax} / 100) = {currency(taxUah)}
                  </code>
                </td>
              </tr>
              <tr>
                <th className="fw-normal">taxUsd</th>
                <td>{currency(taxUsd)}</td>
                <td>
                  Податки: ПДФО 18% + ВЗ 1,5%, перераховані у валюті
                  <br />
                  <code>
                    taxUsd = taxUah / currentExchangeRate = {currency(taxUah)} / {currency(currentExchangeRate)} = {currency(taxUsd)}
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ExchangeRateDifferencesLinks />
      <Subscribe youtube="https://www.youtube.com/watch?v=Fiylm8c8yAc" />
      <Join />
    </main>
  )
}

export default Zero

export const Head: HeadFC = () => <title>Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці</title>
