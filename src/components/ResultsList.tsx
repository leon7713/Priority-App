import type { Track } from '../api/types'
import type { SearchStatus } from '../state/useSearch'

interface ResultsListProps {
  status: SearchStatus
  tracks: Track[]
  error: string | null
}

// Deliberately dumb - it just renders whatever state it's handed. Proper
// loading/empty/error treatment (spinners, retry button, etc) comes later,
// this is enough to see real results on the page for now.
export function ResultsList({ status, tracks, error }: ResultsListProps) {
  if (status === 'idle') {
    return null
  }

  if (status === 'loading') {
    return <p role="status">Searching...</p>
  }

  if (status === 'error') {
    return <p role="alert">{error}</p>
  }

  if (tracks.length === 0) {
    return <p>No results found.</p>
  }

  return (
    <ul className="results-list" aria-label="Search results">
      {tracks.map((track) => (
        <li key={track.id}>
          {track.name} — {track.artist}
        </li>
      ))}
    </ul>
  )
}
