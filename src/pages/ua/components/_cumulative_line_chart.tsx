import * as React from 'react'
import 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js/auto'

export const CumulativeLineChart = ({ title, data }: { title?: string; data: Record<number, number> }) => {
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

  const cumulative: number[] = []
  for (let i = 0; i < Object.values(data).length; i++) {
    const change = Object.values(data)[i]
    const previous = cumulative[i - 1]
    const current = i === 0 ? 1 + change : (1 + change) * previous
    cumulative.push(current)
  }
  const adjusted = cumulative.map((x) => x - 1)

  const points: ChartData<'line', number[], string> = {
    labels: Object.keys(data),
    datasets: [
      {
        data: adjusted, // cumulative, // Object.values(data),
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },
    ],
  }

  return <Chart type="line" data={points} options={options} />
}
