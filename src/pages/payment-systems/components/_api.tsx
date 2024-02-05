import { useEffect, useState } from 'react'

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  var url = new URL('https://gsr.iplan-talks.workers.dev')
  url.searchParams.set('sheet', '1d78yVZ569Glf0Zxsu29eDED00veHjd8Gk4GxyIxkx1I')
  url.searchParams.set('range', range)
  url.searchParams.set('cache', '120')
  try {
    const values = await fetch(url).then((res) => res.json())
    console.groupCollapsed(range)
    console.table(values)
    console.groupEnd()
    return values
  } catch (error) {
    console.group(`Error fetching '${range}' from Google Sheets because of ${error instanceof Error ? error.message : error}`)
    console.error(error)
    console.groupEnd()
    return []
  }
}

export function parseSheetsNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }
  return parseFloat(value.replaceAll(',', '').replaceAll('$', '').replaceAll('%', ''))
}

export function useGoogleSheet(range: string) {
  const [values, setValues] = useState<string[][]>([])
  useEffect(() => {
    fetchGoogleSheetsValues(range).then(setValues)
  }, [range])
  return values
}
