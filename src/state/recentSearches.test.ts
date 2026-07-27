import { describe, expect, it } from 'vitest'
import { addRecentSearch } from './recentSearches'

describe('addRecentSearch', () => {
  it('adds a new term to the front of an empty history', () => {
    expect(addRecentSearch([], 'adele')).toEqual(['adele'])
  })

  it('puts the newest term first, pushing the rest down', () => {
    expect(addRecentSearch(['adele', 'queen'], 'pixies')).toEqual(['pixies', 'adele', 'queen'])
  })

  it('moves a re-searched term to the top instead of duplicating it', () => {
    expect(addRecentSearch(['adele', 'queen', 'pixies'], 'queen')).toEqual(['queen', 'adele', 'pixies'])
  })

  it('treats duplicates case-insensitively', () => {
    expect(addRecentSearch(['Adele', 'queen'], 'adele')).toEqual(['adele', 'queen'])
  })

  it('trims surrounding whitespace before storing', () => {
    expect(addRecentSearch([], '  pixies  ')).toEqual(['pixies'])
  })

  it('leaves history unchanged for an empty or whitespace-only term', () => {
    const history = ['adele', 'queen']
    expect(addRecentSearch(history, '')).toBe(history)
    expect(addRecentSearch(history, '   ')).toBe(history)
  })

  it('keeps only the 5 most recent searches', () => {
    const history = ['a', 'b', 'c', 'd', 'e']
    expect(addRecentSearch(history, 'f')).toEqual(['f', 'a', 'b', 'c', 'd'])
  })
})
