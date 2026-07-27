import { useEffect, useState } from 'react'
import type { SoundApi, Track } from '../api/types'

const DEBOUNCE_MS = 300

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseSearchResult {
  status: SearchStatus
  tracks: Track[]
  error: string | null
}

// Debounces `query`, fires it against the given api, and makes sure a slow
// response from an old query can never clobber the results of a newer one.
// Doesn't know anything about pagination yet - that gets layered on top
// once this is wired into the results list.
export function useSearch(api: SoundApi, query: string): UseSearchResult {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [tracks, setTracks] = useState<Track[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setStatus('idle')
      setTracks([])
      setError(null)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    const timer = setTimeout(() => {
      setStatus('loading')
      setError(null)

      api
        .search(trimmed, null, controller.signal)
        .then((page) => {
          if (cancelled) return
          setTracks(page.tracks)
          setStatus('success')
        })
        .catch((err) => {
          if (cancelled || controller.signal.aborted) return
          setError(err instanceof Error ? err.message : 'Something went wrong')
          setStatus('error')
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [api, query])

  return { status, tracks, error }
}
