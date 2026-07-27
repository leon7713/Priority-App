import type { SearchPage, SoundApi, Track } from './types'

const SEARCH_URL = 'https://api.mixcloud.com/search/'
const PAGE_SIZE = 6

// Only the fields we actually use, everything else in the real response
// gets ignored.
interface MixcloudCloudcast {
  key: string
  url: string
  name: string
  pictures: {
    thumbnail?: string
    medium?: string
    large?: string
    extra_large?: string
  }
  user: {
    username: string
    name: string
  }
}

interface MixcloudSearchResponse {
  data: MixcloudCloudcast[]
  paging: {
    next: string | null
    previous: string | null
  }
}

function toTrack(raw: MixcloudCloudcast): Track {
  return {
    id: raw.key,
    name: raw.name,
    artist: raw.user?.name || raw.user?.username || 'Unknown artist',
    // prefer the biggest image we've got, mixcloud doesn't always send extra_large
    imageUrl: raw.pictures?.extra_large || raw.pictures?.large || raw.pictures?.medium || raw.pictures?.thumbnail || '',
    url: raw.url,
  }
}

export function toSearchPage(raw: MixcloudSearchResponse): SearchPage {
  return {
    tracks: (raw.data ?? []).map(toTrack),
    nextCursor: raw.paging?.next ?? null,
    previousCursor: raw.paging?.previous ?? null,
  }
}

async function search(query: string, cursor?: string | null, signal?: AbortSignal): Promise<SearchPage> {
  // mixcloud's paging.next/previous are already full URLs with the offset
  // baked in, so if we have one we just fetch it directly instead of
  // trying to reconstruct the query params ourselves
  const url = cursor || `${SEARCH_URL}?q=${encodeURIComponent(query)}&type=cloudcast&limit=${PAGE_SIZE}`

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Search request failed (${response.status})`)
  }

  const raw = (await response.json()) as MixcloudSearchResponse
  return toSearchPage(raw)
}

export const mixcloudApi: SoundApi = { search }
