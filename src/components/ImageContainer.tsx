import { forwardRef } from 'react'
import type { Track } from '../api/types'

interface ImageContainerProps {
  track: Track | null
}

export const ImageContainer = forwardRef<HTMLDivElement, ImageContainerProps>(function ImageContainer(
  { track },
  ref,
) {
  return (
    <div className="image-container" ref={ref}>
      {track ? (
        // keyed on the track id so picking a new track always re-triggers the fade-in
        <img key={track.id} className="image-container__image" src={track.imageUrl} alt={`${track.name} by ${track.artist}`} />
      ) : (
        <p className="image-container__placeholder">Select a result to see it here</p>
      )}
    </div>
  )
})
