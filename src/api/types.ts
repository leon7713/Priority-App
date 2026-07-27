// Domain shapes used by the rest of the app. Nothing here should know
// about Mixcloud specifically - that's the whole point of keeping this
// separate from mixcloudClient.ts. A different provider just needs to
// produce these same shapes.

export interface Track {
  id: string
  name: string
  artist: string
  imageUrl: string
  url: string
}

export interface SearchPage {
  tracks: Track[]
  // opaque cursors handed back from the provider - null means "no more pages"
  nextCursor: string | null
  previousCursor: string | null
}

export interface SoundApi {
  search(query: string, cursor?: string | null, signal?: AbortSignal): Promise<SearchPage>
}
