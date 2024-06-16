import * as React from 'react'

import 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js/auto'

export const LineChart = (props: { currency: string; items: { currency: string; months: number | null; yield: number }[] }) => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Погашення через N місяців',
        },
      },
      y: {
        // beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Дохідність %',
        },
      },
    },
    plugins: {
      title: {
        display: false,
      },
    },
  }

  const filtered = props.items.filter((r) => r.currency === props.currency).filter((r) => !!r.months) as { months: number; yield: number }[]
  const months = Array.from(new Set(filtered.map((item) => item.months))).sort((a, b) => a - b)
  const max: Record<number, number> = {}
  const avg: Record<number, number> = {}
  for (const month of months) {
    const rates = filtered.filter((item) => item.months === month).map((item) => item.yield)
    max[month] = Math.max(...rates)
    avg[month] = rates.reduce((acc, rate) => acc + rate, 0) / rates.length
  }

  const points: ChartData<'line', number[], string> = {
    labels: months.map((m) => m.toString()),
    datasets: [
      {
        label: `AVG дохідність (${props.currency}) за період (місяці)`,
        data: Object.values(avg),
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },
    ],
  }

  return <Chart type="line" data={points} options={options} />
}
