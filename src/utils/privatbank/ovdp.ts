import { proxy } from '../proxy'

export interface PrivatOvdp {
  currency: string
  isin: string
  matturity: Date
  bidprice: number
  bidyield: number
  askprice: number
  askyield: number
  yield: string
}

function extract(document: HTMLElement): PrivatOvdp[] {
  return Array.from(
    Array.from(document.querySelectorAll('td'))
      .find((td) => td.textContent?.trim().startsWith('UA4000'))
      ?.closest('.table_block')
      ?.querySelectorAll('table') || []
  )
    .map((table, idx) =>
      Array.from(table.querySelectorAll('tbody tr')).map((tr) => ({
        currency: ['USD', 'EUR', 'UAH'][idx] || '',
        isin: tr.querySelector('td:nth-child(1)')?.textContent?.trim() || '',
        matturity: new Date(tr.querySelector('td:nth-child(2)')?.textContent?.trim().split('.').reverse().join('-') || ''),
        bidprice: parseFloat(tr.querySelector('td:nth-child(3)')?.textContent?.trim() || ''),
        bidyield: parseFloat(tr.querySelector('td:nth-child(4)')?.textContent?.trim() || ''),
        askprice: parseFloat(tr.querySelector('td:nth-child(5)')?.textContent?.trim() || ''),
        askyield: parseFloat(tr.querySelector('td:nth-child(6)')?.textContent?.trim() || ''),
        yield: tr.querySelector('td:nth-child(7)')?.textContent?.trim() || '',
      }))
    )
    .reduce((arr, x) => arr.concat(x), [])
}

export async function getOVDP(): Promise<PrivatOvdp[]> {
  var doc = document.createElement('DIV')
  doc.innerHTML = await proxy('https://privatbank.ua/ovdp', 3600).then((r) => r.text())
  return extract(doc)
}
