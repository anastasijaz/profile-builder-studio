## Melt — Sports Dating App Plan

A mobile-first dating app for sports enthusiasts. Brand: **Melt** — a play on "let's melt together / sweat together". Two main sides toggled via a top segmented control (People ↔ Activities), plus matches and chat.

### Brand & design tokens

Palette (added to `src/styles.css` as semantic tokens):

- `--page: #FFF7EF` — warm cream background
- `--ink: #22172A` — primary text / dark CTAs
- `--accent-orange: #FF8F1F` — primary brand accent (like button, melt heart, active states)
- `--accent-peach: #FFC387` — secondary surfaces (toggle pill, chips)
- `--accent-mint: #96D9BC` — success / "matched" / signed-up state
- `--surface: #FFFFFF`
- `--shadow-card: 0 4px 14px -6px rgba(34,23,42,0.18)`

Typography stays: Instrument Serif (italic wordmark) + Montserrat (UI). Wordmark renamed everywhere: **Melt**, italic serif, with a small drip/heart accent next to it.

Brand voice: warm, playful, sweat-positive. The like button is a melting-heart icon in `--accent-orange`; matches read "You melted with X".

### Information architecture

```
Top toggle:  [ People | Activities ]
Bottom nav:  Discover · Activities · Likes · Chats · Profile
```

Routes (TanStack Router, file-based):

```
src/routes/
  __root.tsx
  index.tsx               # redirects → /discover
  discover.tsx            # People swipe deck (default landing)
  activities.tsx          # existing cards page, polished
  likes.tsx               # people who melted for you
  chats.tsx               # chat list
  chats.$matchId.tsx      # 1:1 thread
  profile.tsx             # the current Tom-style profile (= "my profile")
```

The top toggle on `/discover` and `/activities` deep-links between those routes so the segmented state is shareable.

### People side (Hinge-style)

Stacked, scrollable profile with per-element reactions — not Tinder snap-swipe.

- Hero photo with name, age, distance, sport tags.
- Interleaved blocks the user scrolls through:
  - Photos
  - **Sport prompt cards** with a melt-heart button per card
  - Activities-in-common chip cloud
  - Basic info card (work / studies / home gym / clubs)
- Floating action bar bottom-right: **Pass (X)** and **Super-melt (★)** in `--accent-orange`.
- Tapping a prompt's melt heart sends a like attached to that prompt (Hinge mechanic).

Sport-themed prompt library:

- "My current PR is…"
- "How to approach me at the gym…"
- "Currently training for…"
- "Favourite snack bar…"
- "Post-workout ritual…"
- "My sport origin story…"
- "Race I'd do with a stranger…"

Mock data in `src/data/people.ts`, shape designed for later Lovable Cloud mapping.

### Activities side

Keep the existing card design (image, gym chip, title, location, description, price, Book CTA) and add:

- Filter sheet (sport, date, price, distance) opened from the filter icon.
- "Signed Up" tab uses `--accent-mint` chip and actually filters joined bookings.
- Tapping a card opens `/activities/$activityId` with full detail + Book CTA that moves it into Signed Up.

### Matches & chat

- `/likes` — grid of cards showing which prompt they melted on; tap to view full profile.
- `/chats` — conversation list with avatar, last message, unread mint dot.
- `/chats/$matchId` — bubble thread, sticky input bar, "Suggest activity" button that posts an activity card into the chat.

### Mobile-first responsiveness

The current pages render at mobile size but are pinned to a 420px column. Required changes:

1. **Adaptive shell**: under `sm` fill viewport edge-to-edge with `px-4`; from `sm` upward, center a 420px "phone" column on the cream page with a soft shadow so it reads as a phone-in-frame on desktop/tablet.
2. **Safe areas**: `env(safe-area-inset-bottom)` padding on bottom nav and chat input; `env(safe-area-inset-top)` on top bar.
3. **Touch targets**: every icon button ≥44×44 hit area; chips get 8px vertical padding; `active:scale-[0.97]` feedback on all primary actions.
4. **Scroll behaviour**: `overscroll-contain` on scroll regions; sticky top toggle + bottom nav use `backdrop-blur` with `-webkit-backdrop-filter` fallback.
5. **Images**: explicit `width`/`height`, `loading="lazy"` except first hero, `aspect-[3/4]` portraits / `aspect-[16/10]` activities to prevent CLS.
6. **Typography**: `clamp()` on headings so it reads well 320–430px.
7. **Photo carousel** inside a profile: horizontal scroll-snap (`snap-x snap-mandatory`) — works on all touch devices, no gesture library needed.
8. **Reduced motion**: gate heart-pulse and melt animations behind `motion-safe:`.
9. **Chat keyboard**: thread uses `100dvh` so the input doesn't get covered when the on-screen keyboard opens.

### Testing checklist

Viewports: 320×568, 375×812, 390×844, 414×896, 768×1024, 1280×720.

Verify: top toggle stays sticky, bottom nav clears safe area, swipe deck scrolls smoothly, chat input stays visible with keyboard open, filter sheet closes on backdrop tap, every tap target ≥44px, contrast passes WCAG AA on orange/peach/mint.

### Technical notes

- All routes are static client UI on mock data this pass; no backend.
- New shared components in `src/components/`: `TopToggle`, `BottomNav`, `MeltWordmark`, `ProfileCard`, `PromptCard`, `ActivityCard`, `ChatBubble`, `FilterSheet`.
- Replace inline `#22172A` / `#FFF7EF` strings in existing routes with the new tokens.
- Rename every "Crush" reference to "Melt" (page titles, headers, meta).
- No new npm dependencies — shadcn `Sheet`, `Tabs`, `Button`, `Avatar` already present.

### Build order

1. Add palette tokens + rename to Melt; build `BottomNav`, `TopToggle`, `MeltWordmark` shared components; refactor existing pages onto them.
2. Build `/discover` swipe-feed with mock people + prompts.
3. Polish `/activities` with filter sheet and detail route.
4. Build `/likes`, `/chats`, `/chats/$matchId` with mock conversations.
5. Mobile-responsiveness pass + viewport testing.
