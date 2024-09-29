import { OutputBlockData, OutputData } from '@editorjs/editorjs'
import { ParagraphData } from '@editorjs/paragraph'
import { HeaderData } from '@editorjs/header'
import { ListData } from '@editorjs/list'
import React from 'react'

const Blocks = ({ blocks }: { blocks: OutputBlockData[] }) => {
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
        return <p key={block.id!} dangerouslySetInnerHTML={{ __html: (block.data as ParagraphData).text }} />
      case 'header':
        return <h2 key={block.id!}>{(block.data as HeaderData).text}</h2>
      case 'list':
        return (block.data as ListData).style === 'ordered' ? (
          <ol>
            {(block.data as ListData).items.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ol>
        ) : (
          <ul>
            {(block.data as ListData).items.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        )
      case 'table':
        return (
          <table key={block.id!}>
            {(block.data as { content: string[][] }).content.map((row, rid) => (
              <tr key={rid}>
                {row.map((cell, cid) => (
                  <td key={cid}>{cell}</td>
                ))}
              </tr>
            ))}
          </table>
        )
      case 'delimiter':
        return <hr key={block.id!} />
      default:
        return (
          <p key={block.id!}>
            <pre>{JSON.stringify(block.data, null, 2)}</pre>
          </p>
        )
    }
  })
}

const Note = ({ pageContext: { blocks } }: { pageContext: OutputData }) => {
  console.log(blocks)
  return (
    <div>
      <h1>Note</h1>
      <Blocks blocks={blocks} />
    </div>
  )
}

export default Note
