interface PaginationProps {
  hasPrevious: boolean
  hasNext: boolean
  disabled: boolean
  onPrevious: () => void
  onNext: () => void
}

export function Pagination({ hasPrevious, hasNext, disabled, onPrevious, onNext }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Search result pages">
      <button type="button" onClick={onPrevious} disabled={disabled || !hasPrevious}>
        Previous
      </button>
      <button type="button" onClick={onNext} disabled={disabled || !hasNext}>
        Next
      </button>
    </nav>
  )
}
