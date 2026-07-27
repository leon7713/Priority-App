interface RecentSearchesProps {
  searches: string[]
  onSelect: (term: string) => void
}

export function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
  if (searches.length === 0) {
    return null
  }

  return (
    <section className="recent-searches" aria-label="Recent searches">
      <h2>Recent Searches</h2>
      <ul>
        {searches.map((term) => (
          <li key={term}>
            <button type="button" onClick={() => onSelect(term)}>
              {term}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
