# Priority App

A sound search app built with React + TypeScript for the Priority Front End Developer exam. Search [Mixcloud](https://www.mixcloud.com/developers/) for tracks, page through results 6 at a time, keep a history of recent searches, and fly a result into an image container to play it.

## Running it

```
npm install
npm run dev
```

Then open the printed local URL in Chrome.

Other scripts:

```
npm run build      # type-check + production build
npm run preview    # preview the production build
npm run test       # run unit tests once
npm run test:watch # run unit tests in watch mode
npm run lint        # lint with oxlint
```

## Architecture

The code is split into three layers that don't know about each other except through plain interfaces:

```
src/
  api/          data layer - talks to the sound provider
  state/        business logic - hooks and pure functions, no DOM/JSX
  components/   UI - dumb, reusable, gets data via props
  App.tsx       wires the three together
```

### `api/` - the data layer

`api/types.ts` defines the shapes the rest of the app works with: `Track`, `SearchPage` (a page of tracks plus `nextCursor`/`previousCursor`), and a `SoundApi` interface with a single `search(query, cursor?, signal?)` method. Nothing outside this folder knows the word "Mixcloud".

`api/mixcloudClient.ts` is the only file that knows what Mixcloud's JSON actually looks like. It maps that JSON into the domain types above and exposes `mixcloudApi: SoundApi`. Pagination uses Mixcloud's own `paging.next` / `paging.previous` URLs as opaque cursors rather than computing an offset ourselves - that's what the exam asks for, and it also means we don't have to know or guess how the provider's paging actually works internally.

To swap providers, you'd write a new file next to this one (e.g. `soundcloudClient.ts`) that also returns `Track`/`SearchPage` shapes and implements `SoundApi`, then point `App.tsx` at it. Nothing in `state/` or `components/` would need to change.

### `state/` - business logic

Plain hooks and pure functions, independent of any specific UI:

- `useSearch` - debounces typed input (~300ms), cancels in-flight requests with `AbortController` when a newer one starts, and tracks pagination via the cursors the api layer hands back. It exposes `status`/`tracks`/`error`/`hasNext`/`hasPrevious`/`goNext`/`goPrevious`/`retry` and takes an optional `onSearch` callback that fires once per *new* search term (not on pagination clicks) - that's the hook recent-searches uses to know when to record something, without `useSearch` needing to know recent-searches exists.
- `recentSearches.ts` - a pure `addRecentSearch(history, term)` function: dedupes case-insensitively, moves re-searched terms to the top, caps the list at 5. No React, no storage, easy to unit test in isolation.
- `storage.ts` - a small `localStorage` wrapper that fails safe (corrupt JSON, full storage, private browsing all degrade to an empty list instead of throwing).
- `useRecentSearches` - glues the two together: loads on mount, persists on change, exposes `addSearch`.

### `components/` - the view

Each component takes data and callbacks as props and renders; none of them fetch anything themselves. `ResultsList`, `Pagination`, `RecentSearches`, `SearchBox`, `ImageContainer`, `TrackPlayer`, and `FlyingThumbnail` could all be reused with a completely different data source or state management approach without changes, because they never import `api/` or talk to `localStorage` directly.

`App.tsx` is the only place that wires a concrete provider (`mixcloudApi`) to the state hooks to the components. That's deliberate - it's the one file that's allowed to know about all three layers at once.

### A few notable decisions

- **The fly-to-image animation** (`FlyingThumbnail`) is done with plain CSS transitions and a FLIP-style rect measurement (`getBoundingClientRect` on the clicked result and the image container), rather than pulling in an animation library. It's a small enough effect that a dependency felt unnecessary.
- **Playback** goes through Mixcloud's iframe widget (`TrackPlayer`) rather than an `<audio>` tag, because Mixcloud doesn't expose a raw audio URL - the widget is the only supported playback mechanism.
- **Race conditions**: `useSearch` guards against stale responses in two ways - an `AbortController` per request (aborted the instant a newer request starts, even from a different effect via a shared ref) and a `cancelled` closure flag checked before every state update. Next/Previous clicks are also ignored outright while a request is already in flight, so rapid clicking can't get the page out of sync.
- **Bonus 11 (tile/list toggle) was intentionally skipped** to keep scope focused on the mandatory requirements plus the other bonuses (accessibility, styling, and a decoupled/tested architecture).

## Testing

Unit tests cover the parts of the app that aren't just "render some props": the Mixcloud JSON mapping, the search hook's debounce/abort/pagination/retry behaviour, and the recent-searches dedupe logic plus the storage fallback behaviour. Run them with `npm run test`.

## Git history

The project was built commit by commit rather than as one final dump - see `git log` for the progression from scaffold → data layer → state layer → UI → pagination → recent searches → loading/error states → animation → playback → accessibility → styling.
