import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadRecentSearches, saveRecentSearches } from './storage'

describe('recent searches storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty list when nothing has been saved yet', () => {
    expect(loadRecentSearches()).toEqual([])
  })

  it('round-trips whatever was saved', () => {
    saveRecentSearches(['adele', 'queen'])
    expect(loadRecentSearches()).toEqual(['adele', 'queen'])
  })

  it('falls back to an empty list when the stored value is not valid json', () => {
    localStorage.setItem('priority-app:recent-searches', 'not valid json{')
    expect(loadRecentSearches()).toEqual([])
  })

  it('falls back to an empty list when the stored value is not an array', () => {
    localStorage.setItem('priority-app:recent-searches', JSON.stringify({ oops: true }))
    expect(loadRecentSearches()).toEqual([])
  })

  it('drops any entries that are not strings', () => {
    localStorage.setItem('priority-app:recent-searches', JSON.stringify(['adele', 42, null, 'queen']))
    expect(loadRecentSearches()).toEqual(['adele', 'queen'])
  })

  it('does not throw when localStorage.setItem fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(() => saveRecentSearches(['adele'])).not.toThrow()
  })

  it('does not throw when localStorage.getItem fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    expect(() => loadRecentSearches()).not.toThrow()
    expect(loadRecentSearches()).toEqual([])
  })
})
