import { describe, expect, it, vi } from 'vitest'
import { mixcloudApi, toSearchPage } from './mixcloudClient'

function rawCloudcast(overrides: Record<string, unknown> = {}) {
  return {
    key: '/artist/track/',
    url: 'https://www.mixcloud.com/artist/track/',
    name: 'Track name',
    pictures: { extra_large: 'big.jpg', large: 'large.jpg', medium: 'medium.jpg', thumbnail: 'thumb.jpg' },
    user: { username: 'artist', name: 'Artist Name' },
    ...overrides,
  }
}

describe('toSearchPage', () => {
  it('maps a normal response to our domain shape', () => {
    const page = toSearchPage({
      data: [rawCloudcast()],
      paging: { next: 'https://api.mixcloud.com/search/?offset=6', previous: null },
    })

    expect(page.tracks).toHaveLength(1)
    expect(page.tracks[0]).toEqual({
      id: '/artist/track/',
      name: 'Track name',
      artist: 'Artist Name',
      imageUrl: 'big.jpg',
      url: 'https://www.mixcloud.com/artist/track/',
    })
    expect(page.nextCursor).toBe('https://api.mixcloud.com/search/?offset=6')
    expect(page.previousCursor).toBeNull()
  })

  it('falls back to username when the user has no display name', () => {
    const page = toSearchPage({
      data: [rawCloudcast({ user: { username: 'artist', name: '' } })],
      paging: { next: null, previous: null },
    })

    expect(page.tracks[0].artist).toBe('artist')
  })

  it('falls back through the picture sizes when the bigger ones are missing', () => {
    const page = toSearchPage({
      data: [rawCloudcast({ pictures: { thumbnail: 'thumb.jpg' } })],
      paging: { next: null, previous: null },
    })

    expect(page.tracks[0].imageUrl).toBe('thumb.jpg')
  })

  it('returns an empty list without throwing when there are no results', () => {
    const page = toSearchPage({ data: [], paging: { next: null, previous: null } })

    expect(page.tracks).toEqual([])
    expect(page.nextCursor).toBeNull()
    expect(page.previousCursor).toBeNull()
  })

  it('treats missing paging as no more pages', () => {
    // seen this happen on some mixcloud responses when there's only one page
    const page = toSearchPage({ data: [rawCloudcast()] } as never)

    expect(page.nextCursor).toBeNull()
    expect(page.previousCursor).toBeNull()
  })
})

describe('mixcloudApi.search', () => {
  it('builds the initial search url from the query when there is no cursor', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], paging: { next: null, previous: null } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await mixcloudApi.search('adele')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('q=adele')
    expect(url).toContain('limit=6')

    vi.unstubAllGlobals()
  })

  it('fetches the cursor url directly instead of rebuilding it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], paging: { next: null, previous: null } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const cursor = 'https://api.mixcloud.com/search/?q=adele&type=cloudcast&limit=6&offset=6'
    await mixcloudApi.search('adele', cursor)

    expect(fetchMock).toHaveBeenCalledWith(cursor, expect.anything())

    vi.unstubAllGlobals()
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(mixcloudApi.search('adele')).rejects.toThrow('500')

    vi.unstubAllGlobals()
  })
})
