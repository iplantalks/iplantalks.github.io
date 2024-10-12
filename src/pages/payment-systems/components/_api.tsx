import { useEffect, useState } from 'react'

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  // var url = new URL('https://gsr.iplan-talks.workers.dev')
  // url.searchParams.set('sheet', '1d78yVZ569Glf0Zxsu29eDED00veHjd8Gk4GxyIxkx1I')
  // url.searchParams.set('range', range)
  // url.searchParams.set('cache', '120')
  var url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/gsr2')
  url.searchParams.set('sheet', '1d78yVZ569Glf0Zxsu29eDED00veHjd8Gk4GxyIxkx1I')
  url.searchParams.set('range', range)
  try {
    const res = await fetch(url)
    const text = await res.text()
    const values = JSON.parse(text)
    // console.groupCollapsed('values ' + range)
    // console.table(values)
    // console.groupEnd()
    return values
  } catch (error) {
    alert(`Виникла помилка при завантаженні даних з Google Sheets: ${error instanceof Error ? error.message : error}`)
    console.group(`Error fetching '${range}' from Google Sheets because of ${error instanceof Error ? error.message : error}`)
    console.error(error)
    console.groupEnd()
    return []
  }
}

async function fetchGoogleSheetsTable(range: string): Promise<Array<Record<string, string>>> {
  const values = await fetchGoogleSheetsValues(range)
  const headers = values[0]
  const rows = values.slice(2)
  const data = rows.map((row) => {
    const record: Record<string, string> = {}
    row.forEach((value, index) => {
      if (headers[index] && headers[index].match(/[a-z_0-9]/g)) {
        record[headers[index]] = value || ''
      }
    })
    return record
  })
  console.groupCollapsed('table ' + range)
  console.table(data)
  console.groupEnd()
  return data
}

export function parseSheetsNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  // const result = parseFloat(value.replaceAll('$', '').replaceAll('%', '').replace(/\s+/g, '').replaceAll(',', '.'))
  // console.log('parse', value, value.replaceAll('$', '').replaceAll('%', '').replace(/\s+/g, '').replaceAll(',', '.'), result)
  // return result

  // wtf: do not forget about "special" space symbols
  return parseFloat(value.replaceAll('$', '').replaceAll('%', '').replace(/\s+/g, '').replaceAll(',', '.'))

  // // "$1 000,00" - UA
  // if (value.includes(' ') && value.includes(',') && !value.includes('.')) {
  //   console.log('UA', value)
  //   return parseFloat(value.replaceAll(' ', '').replaceAll(',', '.').replaceAll('$', '').replaceAll('%', ''))
  // }
  // // "$1,000.00" - US
  // else {
  //   console.log('US', value)
  //   return parseFloat(value.replaceAll(',', '').replaceAll('$', '').replaceAll('%', ''))
  // }
}

export function useGoogleSheet(range: string) {
  const [values, setValues] = useState<string[][]>([])
  useEffect(() => {
    fetchGoogleSheetsValues(range).then(setValues)
  }, [range])
  return values
}

export function useGoogleSheetTable(range: string) {
  if (typeof window === 'undefined') {
    return []
  }
  const [data, setData] = useState<Array<Record<string, string>>>([])
  useEffect(() => {
    fetchGoogleSheetsTable(range).then(setData)
  }, [range])
  return data
}
