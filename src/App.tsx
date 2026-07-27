import { useState } from 'react'
import { mixcloudApi } from './api/mixcloudClient'
import { Pagination } from './components/Pagination'
import { RecentSearches } from './components/RecentSearches'
import { ResultsList } from './components/ResultsList'
import { SearchBox } from './components/SearchBox'
import { useRecentSearches } from './state/useRecentSearches'
import { useSearch } from './state/useSearch'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const { recentSearches, addSearch } = useRecentSearches()
  const { status, tracks, error, hasNext, hasPrevious, goNext, goPrevious, retry } = useSearch(
    mixcloudApi,
    query,
    addSearch,
  )

  return (
    <div className="app">
      <h1>Priority App</h1>
      <SearchBox value={query} onChange={setQuery} />
      <ResultsList status={status} tracks={tracks} error={error} onRetry={retry} />
      {status !== 'idle' && (
        <Pagination
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          disabled={status === 'loading'}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}
      <RecentSearches searches={recentSearches} onSelect={setQuery} />
    </div>
  )
}

export default App
