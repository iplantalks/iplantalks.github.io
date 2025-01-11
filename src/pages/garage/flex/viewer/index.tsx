import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import '../../../../styles/common.css'
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
    <h2 className='mb-5'>{name} ({count}) <button onClick={handleCopy} className='btn btn-primary btn-sm'>{label}</button></h2>
    <div className='table-responsive'>
      <table className="table table-striped table-sm table-hover table-bordered">
        <thead>
          <tr className='table-dark'>
            {attributes.map(attr => <th key={attr} className="fw-normal">{attr}</th>)}
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {elements.map((el, i) => <tr key={i}>
            {attributes.map(attr => <td key={attr}>{el.getAttribute(attr)}</td>)}
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
      <div className="container py-5">
        <h1>
          Flex Report Viewer 🔬
        </h1>
        <p>Переглядяч Flex звітів</p>
        <p>Завантажте ваш звіт</p>
        <input id="xml" className="form-control" type="file" accept=".xml" onChange={(e) => handleFileChoosen(e.target.files![0])} />
      </div>
      {tagCounts.map(({ name, count }, i) => <div key={name} className={i % 2 === 0 ? 'bg-body-secondary' : ''}>
        <div className="container py-5">
          <FlexItems name={name} count={count} doc={doc} />
        </div>
      </div>)}
    </main>
  )
}

export default FlexViewer
export const Head: HeadFC = () => <title>Flex Report Viewer</title>
