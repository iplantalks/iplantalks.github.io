import * as React from 'react'
import 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js/auto'

export const CumulativeLinesChart = ({ title, data }: { title?: string; data: Record<string, Record<number, number>> }) => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          format: {
            style: 'percent',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  }

  const cumulative: Record<string, number[]> = {}
  const adjusted: Record<string, number[]> = {}
  for (const key of Object.keys(data)) {
    cumulative[key] = []
    for (let i = 0; i < Object.values(data[key]).length; i++) {
      const change = Object.values(data[key])[i]
      const previous = cumulative[key][i - 1]
      const current = i === 0 ? 1 + change : (1 + change) * previous
      cumulative[key].push(current)
    }
    adjusted[key] = cumulative[key].map((x) => x - 1)
  }

  const points: ChartData<'line', number[], string> = {
    labels: Object.keys(data[Object.keys(data)[0]]),
    datasets: Object.entries(adjusted).map(([key, value]) => ({
      data: value,
      label: key,
      cubicInterpolationMode: 'monotone',
      tension: 0.4,
    })),
  }

  return <Chart type="line" data={points} options={options} />
}
