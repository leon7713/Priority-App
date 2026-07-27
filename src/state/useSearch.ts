import { useEffect, useRef, useState } from 'react'
import type { SoundApi, Track } from '../api/types'

const DEBOUNCE_MS = 300

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseSearchResult {
  status: SearchStatus
  tracks: Track[]
  error: string | null
  hasNext: boolean
  hasPrevious: boolean
  goNext: () => void
  goPrevious: () => void
}

interface SearchRequest {
  query: string
  cursor: string | null
}

// Debounces raw typing into a fresh "page 1" request. Clicking next/previous
// bypasses the debounce entirely and reuses whatever cursor mixcloud gave us
// on the last page - no offset math on our end.
//
// `onSearch`, if given, fires once per debounced term - right when we
// actually go looking for it, not on every keystroke and not again for
// next/previous clicks. It's how recent-searches gets fed without this
// hook needing to know recent-searches exists.
export function useSearch(api: SoundApi, query: string, onSearch?: (term: string) => void): UseSearchResult {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [tracks, setTracks] = useState<Track[]>([])
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [previousCursor, setPreviousCursor] = useState<string | null>(null)
  const [request, setRequest] = useState<SearchRequest | null>(null)

  // shared with the debounce effect below so a keystroke can kill whatever
  // request is currently in flight, even though the two effects run separately
  const activeController = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      activeController.current?.abort()
      setRequest(null)
      return
    }

    const timer = setTimeout(() => {
      onSearch?.(trimmed)
      setRequest({ query: trimmed, cursor: null })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      activeController.current?.abort()
    }
    // onSearch is intentionally left out - it's usually an inline callback from
    // the caller, and including it would restart the debounce on every render
  }, [query])

  useEffect(() => {
    if (!request) {
      setStatus('idle')
      setTracks([])
      setError(null)
      setNextCursor(null)
      setPreviousCursor(null)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    activeController.current = controller

    setStatus('loading')
    setError(null)

    api
      .search(request.query, request.cursor, controller.signal)
      .then((page) => {
        if (cancelled || controller.signal.aborted) return
        setTracks(page.tracks)
        setNextCursor(page.nextCursor)
        setPreviousCursor(page.previousCursor)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setStatus('error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [api, request])

  function goNext() {
    if (status === 'loading' || !request || nextCursor === null) return
    setRequest({ query: request.query, cursor: nextCursor })
  }

  function goPrevious() {
    if (status === 'loading' || !request || previousCursor === null) return
    setRequest({ query: request.query, cursor: previousCursor })
  }

  return {
    status,
    tracks,
    error,
    hasNext: nextCursor !== null,
    hasPrevious: previousCursor !== null,
    goNext,
    goPrevious,
  }
}
