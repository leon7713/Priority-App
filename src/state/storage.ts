const RECENT_SEARCHES_KEY = 'priority-app:recent-searches'

export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    // corrupt json, storage disabled, whatever - just start from empty history
    return []
  }
}

export function saveRecentSearches(history: string[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(history))
  } catch {
    // e.g. storage full or blocked in private browsing - not worth crashing over
  }
}
