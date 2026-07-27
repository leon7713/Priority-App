import { useState } from 'react'
import { mixcloudApi } from './api/mixcloudClient'
import { Pagination } from './components/Pagination'
import { ResultsList } from './components/ResultsList'
import { SearchBox } from './components/SearchBox'
import { useSearch } from './state/useSearch'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const { status, tracks, error, hasNext, hasPrevious, goNext, goPrevious } = useSearch(mixcloudApi, query)

  return (
    <div className="app">
      <h1>Priority App</h1>
      <SearchBox value={query} onChange={setQuery} />
      <ResultsList status={status} tracks={tracks} error={error} />
      {status !== 'idle' && (
        <Pagination
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          disabled={status === 'loading'}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}
    </div>
  )
}

export default App
