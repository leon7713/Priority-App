import type { ChangeEvent, FormEvent } from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // the actual search already runs as the user types (see useSearch),
    // this is just here so hitting enter / clicking "Go" doesn't reload the page
    event.preventDefault()
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <form className="search-box" role="search" onSubmit={handleSubmit}>
      <label htmlFor="search-input">Search</label>
      <input
        id="search-input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search for a track or artist"
        autoComplete="off"
      />
      <button type="submit">Go</button>
    </form>
  )
}
