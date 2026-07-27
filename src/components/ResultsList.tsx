import type { MouseEvent } from 'react'
import type { Track } from '../api/types'
import type { SearchStatus } from '../state/useSearch'

interface ResultsListProps {
  status: SearchStatus
  tracks: Track[]
  error: string | null
  onRetry: () => void
  onSelect: (track: Track, sourceRect: DOMRect) => void
}

export function ResultsList({ status, tracks, error, onRetry, onSelect }: ResultsListProps) {
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

  function handleClick(event: MouseEvent<HTMLButtonElement>, track: Track) {
    onSelect(track, event.currentTarget.getBoundingClientRect())
  }

  return (
    <>
      {/* list-style: none makes some screen readers (VoiceOver) drop the list
          semantics entirely, so the roles below are added back explicitly */}
      <p className="visually-hidden" role="status">
        {tracks.length} result{tracks.length === 1 ? '' : 's'} found
      </p>
      <ul className="results-list" role="list" aria-label="Search results">
        {tracks.map((track) => (
          <li key={track.id} role="listitem">
            <button type="button" className="result-item" onClick={(event) => handleClick(event, track)}>
              {track.imageUrl && <img className="result-item__thumb" src={track.imageUrl} alt="" />}
              <span>
                {track.name} — {track.artist}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
