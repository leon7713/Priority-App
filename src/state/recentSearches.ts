export const MAX_RECENT_SEARCHES = 5

// Adds `term` to the front of `history`. If it's already in there
// (case-insensitively) the old entry is dropped rather than kept as a
// duplicate - it just moves to the top with whatever casing was just typed.
export function addRecentSearch(history: string[], term: string): string[] {
  const trimmed = term.trim()
  if (!trimmed) return history

  const withoutDuplicate = history.filter((existing) => existing.toLowerCase() !== trimmed.toLowerCase())

  return [trimmed, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES)
}
