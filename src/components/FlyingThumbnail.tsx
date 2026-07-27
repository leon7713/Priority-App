import { useEffect, useState } from 'react'
import type { CSSProperties, TransitionEvent } from 'react'

interface FlyingThumbnailProps {
  imageUrl: string
  fromRect: DOMRect
  toRect: DOMRect
  onDone: () => void
}

// A cloned thumbnail that visually travels from where a result was clicked
// to the image container, fading out as it lands. Plain CSS transitions -
// no animation library needed for something this small.
export function FlyingThumbnail({ imageUrl, fromRect, toRect, onDone }: FlyingThumbnailProps) {
  const [landed, setLanded] = useState(false)

  useEffect(() => {
    // start it at the source rect first, then flip to the target on the next
    // frame so the browser has something to actually transition between
    const frame = requestAnimationFrame(() => setLanded(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const rect = landed ? toRect : fromRect

  const style: CSSProperties = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    opacity: landed ? 0 : 1,
    transition: landed ? 'top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease, opacity 0.4s ease' : 'none',
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLImageElement>) {
    // several properties transition at once - only react to the last one
    if (event.propertyName === 'opacity') {
      onDone()
    }
  }

  return (
    <img
      src={imageUrl}
      alt=""
      aria-hidden="true"
      className="flying-thumbnail"
      style={style}
      onTransitionEnd={handleTransitionEnd}
    />
  )
}
