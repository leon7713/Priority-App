import { useRef, useState } from 'react'
import type { Track } from './api/types'
import { mixcloudApi } from './api/mixcloudClient'
import { FlyingThumbnail } from './components/FlyingThumbnail'
import { ImageContainer } from './components/ImageContainer'
import { Pagination } from './components/Pagination'
import { RecentSearches } from './components/RecentSearches'
import { ResultsList } from './components/ResultsList'
import { SearchBox } from './components/SearchBox'
import { useRecentSearches } from './state/useRecentSearches'
import { useSearch } from './state/useSearch'
import './App.css'

interface Flight {
  track: Track
  fromRect: DOMRect
  toRect: DOMRect
}

function App() {
  const [query, setQuery] = useState('')
  const { recentSearches, addSearch } = useRecentSearches()
  const { status, tracks, error, hasNext, hasPrevious, goNext, goPrevious, retry } = useSearch(
    mixcloudApi,
    query,
    addSearch,
  )

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [flight, setFlight] = useState<Flight | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  function handleResultSelect(track: Track, sourceRect: DOMRect) {
    const container = imageContainerRef.current
    if (!container || !track.imageUrl) {
      // nothing sensible to animate towards/from - just show it
      setSelectedTrack(track)
      return
    }

    setFlight({ track, fromRect: sourceRect, toRect: container.getBoundingClientRect() })
  }

  function handleFlightDone() {
    if (flight) {
      setSelectedTrack(flight.track)
    }
    setFlight(null)
  }

  return (
    <div className="app">
      <h1>Priority App</h1>
      <SearchBox value={query} onChange={setQuery} />
      <ResultsList status={status} tracks={tracks} error={error} onRetry={retry} onSelect={handleResultSelect} />
      {status !== 'idle' && (
        <Pagination
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          disabled={status === 'loading'}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}
      <ImageContainer ref={imageContainerRef} track={selectedTrack} />
      <RecentSearches searches={recentSearches} onSelect={setQuery} />
      {flight && (
        <FlyingThumbnail
          imageUrl={flight.track.imageUrl}
          fromRect={flight.fromRect}
          toRect={flight.toRect}
          onDone={handleFlightDone}
        />
      )}
    </div>
  )
}

export default App
