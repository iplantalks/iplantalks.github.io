import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useState } from 'react'
import '../../../styles/common.css'
import { Header } from '../../../components/header'

import 'chart.js/auto'
import { Chart } from 'react-chartjs-2'

export interface Instument {
  name: string
  returns: number
  texes: number
  minimal_investment: number
  minimal_period: number
}

const Compass = () => {
  // const { user } = useAuth()
  // useEffect(() => {
  //   if (user === null) {
  //     navigate('/login?redirect=' + window.location.pathname)
  //   }
  // }, [user])

  const [risks, setRisks] = useState<string[]>(['Ризик реструктуризації', 'Ризик дефолту', 'Ризик ліквідності', 'Ризик курсових коливань', 'Ризик інфляції', 'Ризик ліквідації', 'Ризик пограбування'])

  const [instruments, setInstruments] = useState<Instument[]>([
    { name: 'Скринька, матрац', returns: 0, texes: 0, minimal_investment: 0, minimal_period: 0 },
    { name: 'ОВДП $', returns: 4.5, texes: 0, minimal_investment: 1000, minimal_period: 0 },
    { name: 'Депозит в банку', returns: 3, texes: 0, minimal_investment: 0, minimal_period: 0 },
    { name: 'Депозит в платіжці (Wise, Revolut, тощо)', returns: 3.5, texes: 19.5, minimal_investment: 0, minimal_period: 0 },
    { name: 'Депозит в Interactive Brokers', returns: 4, texes: 19.5, minimal_investment: 10000, minimal_period: 0 },
    { name: 'Фондовий ринок ETF', returns: 8, texes: 19.5, minimal_investment: 200, minimal_period: 0 },
    { name: 'Фондовий ринок Target Date ETF', returns: 8, texes: 19.5, minimal_investment: 200, minimal_period: 0 },
    { name: 'Фондовий ринок Goverment Treasury Bonds', returns: 4.5, texes: 19.5, minimal_investment: 1000, minimal_period: 0 },
    { name: 'UA Eurobonds', returns: 9, texes: 0, minimal_investment: 30000, minimal_period: 0 },
  ])

  const updateInsturment = (index: number, instrument: Instument) => {
    const newInstruments = [...instruments]
    newInstruments[index] = instrument
    setInstruments(newInstruments)
  }

  const removeInstrument = (index: number) => {
    const newInstruments = [...instruments]
    newInstruments.splice(index, 1)
    setInstruments(newInstruments)
  }

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h1>
          <span className="text-secondary">Invsting</span> Compass 🧭
        </h1>
        <p>Компас консервативного інвестора - поточний ландшафт інвест. інструментів з фікс.дохідністю для валютних коштів*</p>
        <Chart
          type="radar"
          data={{
            labels: risks,
            datasets: [
              {
                data: risks.map((r, i) => i),
              },
            ],
          }}
        />
        <h2>Інструменти</h2>
        <table className="table">
          <tbody>
            {instruments.map((instrument, index) => (
              <tr key={index}>
                <td>
                  <input className="form-control" type="text" value={instrument.name} onChange={(e) => updateInsturment(index, { ...instrument, name: e.target.value })} />
                </td>
                <td>
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={instrument.returns}
                    onChange={(e) => updateInsturment(index, { ...instrument, returns: e.target.valueAsNumber || 0 })}
                  />
                </td>
                <td>{instrument.texes}</td>
                <td>{instrument.minimal_investment}</td>
                <td>{instrument.minimal_period}</td>
                <td>
                  <button className="btn btn-outline-primary" onClick={() => removeInstrument(index)}>
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default Compass
export const Head: HeadFC = () => <title>Compass</title>
