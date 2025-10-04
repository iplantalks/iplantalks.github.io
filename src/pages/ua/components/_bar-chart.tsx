import * as React from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions, BarOptions, ChartType, ChartTypeRegistry, ChartData } from 'chart.js'
import { Bar } from 'react-chartjs-2'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export interface BarChartProps {
  title?: string
  labels: string[]
  data: Record<string, number[]>
}

export const BarChart = (props: BarChartProps) => {
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
        position: 'bottom',
      },
      title: {
        display: !!props.title,
        text: props.title,
      },
    },
  }

  const data: ChartData<'bar', number[], string> = {
    labels: props.labels,
    datasets: Object.entries(props.data).map(([label, data]) => ({
      label,
      data,
      backgroundColor: data.map((v) => (v > 0 ? 'green' : 'red')),
    })),
  }

  return <Bar options={options} data={data} />
}
