import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Header } from '../../../../components/header'

const FlexItems = ({ name, count, doc }: { name: string; count: number, doc: Document | null }) => {
  const [label, setLabel] = useState('copy')
  if (!doc) {
    return null
  }
  const elements = useMemo(() => Array.from(doc.querySelectorAll(name)), [doc])
  const attributes = useMemo(() => Array.from(new Set(elements.flatMap(el => el.getAttributeNames()))), [elements])
  const text = useMemo(() => {
    let text = attributes.join('\t') + '\n'
    text += elements.map(el => attributes.map(attr => el.getAttribute(attr)).join('\t')).join('\n')
    return text
  }, [attributes, elements])
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setLabel('copied')
      setTimeout(() => setLabel('copy'), 2000)
    })
  }
  return <div>
    <h2 className='text-2xl font-bold mb-5'>{name} ({count}) <button onClick={handleCopy} className='px-2 py-1 text-sm rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'>{label}</button></h2>
    <div className='overflow-x-auto'>
      <table className="table-auto text-sm">
        <thead>
          <tr className='bg-black text-white'>
            {attributes.map(attr => <th key={attr} className="p-1 font-normal text-nowrap">{attr}</th>)}
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {elements.map((el, i) => <tr key={i}>
            {attributes.map(attr => <td className={'p-1 border border-neutral-200 text-nowrap' + (i % 2 == 0 ? ' bg-neutral-100' : '')} key={attr}>{el.getAttribute(attr)}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>
}

const FlexViewer = () => {
  const [doc, setDoc] = useState<Document | null>(null)
  const handle = (xml: string) => {
    setDoc(new DOMParser().parseFromString(xml, 'text/xml'))
  }

  const handleFileChoosen = async (file: File) => {
    const text = await file.text()
    handle(text)
  }

  useEffect(() => {
    fetch('/garage/flex/viewer/sample.xml')
      .then((res) => res.text())
      .then(handle)
  }, [])

  const tagNames = useMemo(() => Array.from(doc?.querySelectorAll('*') ?? []).map(el => el.tagName), [doc])
  const tagCounts = useMemo(() => Array.from(new Set(tagNames)).map(name => ({ name, count: tagNames.filter(n => n === name).length })).filter(({ count }) => count > 1).sort((a, b) => b.count - a.count), [tagNames])

  return (
    <main>
      <Header />

      <div className="container mx-auto my-5 p-4">
        <h1 className='text-2xl font-bold mb-3'>
          Flex Report Viewer 🔬
        </h1>
        <p className='mb-3'>Переглядяч Flex звітів</p>
        <p className='mb-3'>Завантажте ваш звіт</p>
        <input id="xml" className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" type="file" accept=".xml" onChange={(e) => handleFileChoosen(e.target.files![0])} />
      </div>

      {tagCounts.map(({ name, count }, i) => <div key={name} className={i % 2 === 0 ? 'bg-body-secondary' : ''}>
        <div className="container mx-auto my-5 p-4">
          <FlexItems name={name} count={count} doc={doc} />
        </div>
      </div>)}
    </main>
  )
}

export default FlexViewer
export const Head: HeadFC = () => <title>Flex Report Viewer</title>
