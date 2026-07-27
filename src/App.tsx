import { useState } from 'react'
import { mixcloudApi } from './api/mixcloudClient'
import { ResultsList } from './components/ResultsList'
import { SearchBox } from './components/SearchBox'
import { useSearch } from './state/useSearch'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const { status, tracks, error } = useSearch(mixcloudApi, query)

  return (
    <div className="app">
      <h1>Priority App</h1>
      <SearchBox value={query} onChange={setQuery} />
      <ResultsList status={status} tracks={tracks} error={error} />
    </div>
  )
}

export default App
