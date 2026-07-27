import { useEffect, useState } from 'react'
import { addRecentSearch } from './recentSearches'
import { loadRecentSearches, saveRecentSearches } from './storage'

export interface UseRecentSearchesResult {
  recentSearches: string[]
  addSearch: (term: string) => void
}

export function useRecentSearches(): UseRecentSearchesResult {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches())

  useEffect(() => {
    saveRecentSearches(recentSearches)
  }, [recentSearches])

  function addSearch(term: string) {
    setRecentSearches((current) => addRecentSearch(current, term))
  }

  return { recentSearches, addSearch }
}
