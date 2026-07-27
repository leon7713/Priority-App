import { useEffect, useRef, useState } from 'react'
import type { Track } from './api/types'
import { mixcloudApi } from './api/mixcloudClient'
import { FlyingThumbnail } from './components/FlyingThumbnail'
import { ImageContainer } from './components/ImageContainer'
import { Pagination } from './components/Pagination'
import { RecentSearches } from './components/RecentSearches'
import { ResultsList } from './components/ResultsList'
import { SearchBox } from './components/SearchBox'
import { TrackPlayer } from './components/TrackPlayer'
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [flight, setFlight] = useState<Flight | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  function selectTrack(track: Track) {
    setSelectedTrack(track)
    // picking a different track should stop whatever was already embedded -
    // the user has to click the (new) image to start playing it
    setIsPlaying(false)
  }

  function handleResultSelect(track: Track, sourceRect: DOMRect) {
    const container = imageContainerRef.current
    if (!container || !track.imageUrl) {
      // nothing sensible to animate towards/from - just show it
      selectTrack(track)
      return
    }

    setFlight({ track, fromRect: sourceRect, toRect: container.getBoundingClientRect() })
  }

  function handleFlightDone() {
    if (flight) {
      selectTrack(flight.track)
    }
    setFlight(null)
  }

  // once a result lands in the image container, move focus there - keyboard
  // and screen reader users would otherwise be left on a result button that
  // just visually flew away
  useEffect(() => {
    if (selectedTrack) {
      imageContainerRef.current?.querySelector('button')?.focus()
    }
  }, [selectedTrack])

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
      <ImageContainer ref={imageContainerRef} track={selectedTrack} onImageClick={() => setIsPlaying(true)} />
      {selectedTrack && isPlaying && <TrackPlayer track={selectedTrack} />}
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
