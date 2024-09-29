import type { GatsbyNode } from 'gatsby'
import { resolve } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { OutputData } from '@editorjs/editorjs'

function isEditorJsBlock(item: unknown): boolean {
  if (!item || typeof item !== 'object') {
    return false
  }
  const { id, type, data } = item as Record<string, unknown>
  if (typeof id !== 'string' || typeof type !== 'string' || typeof data !== 'object') {
    return false
  }
  return true
}

async function getNotes() {
  const items: OutputData[] = []
  const files = readdirSync(resolve('./src/pages'), { recursive: true })
  for (const file of files) {
    if (typeof file !== 'string') {
      continue
    }
    if (!file.endsWith('.json')) {
      continue
    }
    try {
      const { time, version, blocks } = JSON.parse(readFileSync(resolve('./src/pages', file), 'utf-8'))
      if (!time || typeof time !== 'number') {
        continue
      }
      if (!version || typeof version !== 'string' || !version.match(/^\d+\.\d+\.\d+$/)) {
        continue
      }
      if (!blocks || !Array.isArray(blocks) || !blocks.every(isEditorJsBlock)) {
        continue
      }
      items.push({ time, version, blocks })
    } catch {
      continue
    }
  }
  return items
}

type Person = {
  id: number
  name: string
  age: number
}

async function getSomeData(): Promise<Person[]> {
  return [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Doe', age: 25 },
  ]
}

export const sourceNodes: GatsbyNode['sourceNodes'] = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  const data = await getSomeData()

  data.forEach((person: Person) => {
    const node = {
      ...person,
      parent: null,
      children: [],
      id: createNodeId(`person__${person.id}`),
      internal: {
        type: 'Person',
        content: JSON.stringify(person),
        contentDigest: createContentDigest(person),
      },
    }

    createNode(node)
  })
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, createNodeId }) => {
  const { createPage } = actions

  console.log('>>>>>>>>>> createPages <<<<<<<<')
  const notes = await getNotes()
  for (const note of notes) {
    console.log('note', note)
    createPage({
      path: `/note/${note.time}`,
      component: resolve('./src/templates/note.tsx'),
      context: note,
    })
  }

  const result = await graphql<{ allPerson?: { nodes: Person[] } }>(`
    query {
      allPerson {
        nodes {
          id
          name
          age
        }
      }
    }
  `)
  result.data?.allPerson?.nodes.forEach((person: Person) => {
    createPage({
      path: `/person/${person.id}`,
      component: resolve('./src/templates/person.tsx'),
      context: person,
    })
  })
}
