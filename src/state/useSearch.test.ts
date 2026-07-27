import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SearchPage, SoundApi } from '../api/types'
import { useSearch } from './useSearch'

function page(names: string[]): SearchPage {
  return {
    tracks: names.map((name) => ({ id: name, name, artist: '', imageUrl: '', url: '' })),
    nextCursor: null,
    previousCursor: null,
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits for the debounce window before calling the api', async () => {
    const search = vi.fn().mockReturnValue(new Promise(() => {}))
    const api: SoundApi = { search }

    renderHook(({ query }) => useSearch(api, query), { initialProps: { query: 'adele' } })

    expect(search).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(299))
    expect(search).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(search).toHaveBeenCalledTimes(1)
  })

  it('never lets a stale response overwrite a newer one', async () => {
    const first = deferred<SearchPage>()
    const second = deferred<SearchPage>()
    const search = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const api: SoundApi = { search }

    const { rerender, result } = renderHook(({ query }) => useSearch(api, query), {
      initialProps: { query: 'adele' },
    })

    await act(() => vi.advanceTimersByTimeAsync(300))
    rerender({ query: 'queen' })
    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(search).toHaveBeenCalledTimes(2)

    // the newer (queen) search resolves first
    await act(async () => {
      second.resolve(page(['Queen result']))
      await second.promise
    })
    expect(result.current.tracks[0].name).toBe('Queen result')

    // the stale (adele) search resolves after - it must be ignored
    await act(async () => {
      first.resolve(page(['Adele result']))
      await first.promise
    })
    expect(result.current.tracks[0].name).toBe('Queen result')
  })

  it('aborts the in-flight request as soon as the query changes', async () => {
    const search = vi.fn().mockReturnValue(new Promise(() => {}))
    const api: SoundApi = { search }

    const { rerender } = renderHook(({ query }) => useSearch(api, query), {
      initialProps: { query: 'adele' },
    })
    await act(() => vi.advanceTimersByTimeAsync(300))

    const firstSignal = search.mock.calls[0][2] as AbortSignal
    expect(firstSignal.aborted).toBe(false)

    rerender({ query: 'queen' })
    expect(firstSignal.aborted).toBe(true)
  })

  it('goes idle -> loading -> success for a normal search', async () => {
    const search = vi.fn().mockResolvedValue(page(['Result 1']))
    const api: SoundApi = { search }

    const { result } = renderHook(() => useSearch(api, 'adele'))
    expect(result.current.status).toBe('idle')

    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(result.current.status).toBe('success')
    expect(result.current.tracks).toHaveLength(1)
  })

  it('surfaces a readable error when the request fails', async () => {
    const search = vi.fn().mockRejectedValue(new Error('network down'))
    const api: SoundApi = { search }

    const { result } = renderHook(() => useSearch(api, 'adele'))
    await act(() => vi.advanceTimersByTimeAsync(300))

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('network down')
  })

  it('does not treat a deliberate abort as an error', async () => {
    const search = vi.fn().mockImplementation((_query: string, _cursor, signal: AbortSignal) => {
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          const abortError = new Error('aborted')
          abortError.name = 'AbortError'
          reject(abortError)
        })
      })
    })
    const api: SoundApi = { search }

    const { rerender, result } = renderHook(({ query }) => useSearch(api, query), {
      initialProps: { query: 'adele' },
    })
    await act(() => vi.advanceTimersByTimeAsync(300))
    rerender({ query: 'queen' })
    await act(() => vi.advanceTimersByTimeAsync(0))

    expect(result.current.status).not.toBe('error')
  })

  it('clears results and goes back to idle when the query is emptied', async () => {
    const search = vi.fn().mockReturnValue(new Promise(() => {}))
    const api: SoundApi = { search }

    const { rerender, result } = renderHook(({ query }) => useSearch(api, query), {
      initialProps: { query: 'adele' },
    })
    await act(() => vi.advanceTimersByTimeAsync(300))

    rerender({ query: '' })
    expect(result.current.status).toBe('idle')
    expect(result.current.tracks).toEqual([])
  })
})
