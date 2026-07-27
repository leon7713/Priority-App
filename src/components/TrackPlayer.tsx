import type { Track } from '../api/types'

interface TrackPlayerProps {
  track: Track
}

// Mixcloud plays tracks through their own widget iframe - there's no
// separate "audio file url" we could hand to an <audio> tag.
export function TrackPlayer({ track }: TrackPlayerProps) {
  const src = `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(track.url)}&autoplay=1&hide_cover=1&light=1`

  return (
    <iframe
      key={track.id}
      className="track-player"
      title={`${track.name} by ${track.artist}`}
      src={src}
      allow="autoplay"
      style={{ border: 0 }}
    />
  )
}
