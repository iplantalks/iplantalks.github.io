import * as React from 'react'
import { useGoogleSheet } from './_api'

export interface VideoLink {
  name: string
  category: string
  youtube: string
}

export function useVideoLinks() {
  if (typeof window === 'undefined') { return [] }
  return useGoogleSheet('Videos!A2:Z').map(
    (row): VideoLink => ({
      name: row[0],
      category: row[1],
      youtube: row[2],
    })
  )
}
