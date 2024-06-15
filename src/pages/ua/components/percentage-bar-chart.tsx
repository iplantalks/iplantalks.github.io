import * as React from 'react'

import 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js/auto'

export const PercentageBarChart = ({ title, data, inversed }: { title?: string; data: Record<number, number>; inversed?: boolean }) => {
  const options: ChartOptions<'bar'> = {
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

  const color = (v: number) => {
    const colors_from_green_to_red = ['#00876c', '#6aaa96', '#aecdc2', '#f1f1f1', '#f0b8b8', '#e67f83', '#d43d51']
    if (inversed) {
      v = -v
    }
    // small values are white
    if (Math.abs(v) <= 0.01) {
      return colors_from_green_to_red[3]
    }
    // edge cases more than 100% are dark red/green
    if (v <= -1) {
      return colors_from_green_to_red[6]
    }
    if (v >= 1) {
      return colors_from_green_to_red[0]
    }
    // 25% is the threshold for the color change
    if (v <= -0.25) {
      return colors_from_green_to_red[5]
    }
    if (v >= 0.25) {
      return colors_from_green_to_red[1]
    }
    // 0% is the threshold for the color change
    if (v < 0) {
      return colors_from_green_to_red[4]
    }
    if (v > 0) {
      return colors_from_green_to_red[2]
    }
  }

  const bars: ChartData<'bar', number[], string> = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: Object.values(data).map(color),
      },
    ],
  }

  return <Chart type="bar" options={options} data={bars} />
}
