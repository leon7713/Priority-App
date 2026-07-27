import type { Track } from '../api/types'
import type { SearchStatus } from '../state/useSearch'

interface ResultsListProps {
  status: SearchStatus
  tracks: Track[]
  error: string | null
  onRetry: () => void
}

export function ResultsList({ status, tracks, error, onRetry }: ResultsListProps) {
  if (status === 'idle') {
    return null
  }

  if (status === 'loading') {
    return (
      <p className="status-message" role="status">
        <span className="spinner" aria-hidden="true" />
        Searching…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status-message status-message--error" role="alert">
        <p>{error ?? 'Something went wrong.'}</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (tracks.length === 0) {
    return <p className="status-message">No results found. Try a different search.</p>
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
