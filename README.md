# Smart Campus Room Availability Checker

A read-only prototype that lets campus staff filter rooms by capacity and equipment, then check whether a chosen room is free for a requested time window. No bookings are created or saved — the app only answers "is this room available?"

Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. Logic is covered by **Vitest** unit tests.

---

## Features

### Room Filtering

- **F1 — Capacity filter:** Enter an attendee count; only rooms with `capacity ≥ attendees` are shown.
- **F2 — Equipment filter:** Select required equipment items; only rooms that have *all* selected items are shown.
- **F4 — Empty state:** When no rooms match the filters, a helpful message suggests lowering the attendee count or removing equipment requirements.

### Availability Check

- **AC1 — Input validation:** Times must be whole numbers, `0 ≤ start < end ≤ 1440`, and `start` must be later than the current (frozen) time of 09:00.
- **AC2 — Max duration:** A request may last up to 120 minutes; 121+ is rejected.
- **AC3 — Blocked rooms:** A blocked room is always unavailable, regardless of free slots.
- **AC4 — Overlap detection:** A request that overlaps an existing booking is rejected. Touching endpoints are allowed (e.g. a request ending at 660 when a booking starts at 660 is fine).
- **AC5 — No mutation:** Checking availability never modifies the room or its bookings.

### UI niceties

- Matching-room count and current time displayed as summary cards.
- Selected room shows capacity, status, equipment tags, and existing bookings.
- Result banner clearly states "Available" or "Unavailable" with a human-readable reason.
- Prior results clear automatically when inputs change.

---

## Tech Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Framework      | React 18                        |
| Language       | TypeScript                      |
| Build tool     | Vite                            |
| Styling        | Tailwind CSS                    |
| Icons          | lucide-react                    |
| Testing        | Vitest + Testing Library + jsdom|

---

## Project Structure

```
src/
├── App.tsx                     # Main screen — filters, room list, check form, results
├── data/
│   └── roomData.ts             # Fictional rooms, equipment catalog, frozen "now"
├── lib/
│   ├── availability.ts         # Domain types + booking rules (pure functions)
│   ├── roomFilter.ts           # Room filtering by capacity & equipment
│   └── __tests__/              # Unit tests for the above
├── components/
│   ├── Equipment.tsx           # Equipment selector & tag display
│   ├── BookingList.tsx         # Existing-bookings list for a room
│   ├── EmptyState.tsx          # "No rooms match" fallback
│   ├── ErrorList.tsx           # Validation error messages
│   ├── InfoCard.tsx            # Small labelled summary card
│   ├── ResultBanner.tsx        # Available / Unavailable banner
│   ├── RoomDetails.tsx         # Selected room detail panel
│   ├── RoomList.tsx            # Selectable list of matching rooms
│   └── TimeField.tsx           # Numeric time input with live HH:MM preview
├── index.css                   # Tailwind directives
└── main.tsx                    # React entry point
```

Logic lives in `src/lib/` as pure functions with no side effects, making them easy to unit-test independently of the UI. All fictional data is hardcoded in `src/data/roomData.ts` — there is no database or backend.

---

## Example Data

Four fictional rooms with varied capacity, equipment, and bookings. "Now" is frozen at **09:00 (540 min after midnight)** for the prototype.

| Room | Building          | Capacity | Equipment                                          | Blocked | Bookings (min)         |
| ---- | ----------------- | -------- | -------------------------------------------------- | ------- | ---------------------- |
| B204 | Engineering Block B | 30       | Projector, Whiteboard, Audio System                | No      | 600–660, 840–900       |
| A110 | Arts Block A      | 50       | Projector, Video Conferencing, Smart TV, Audio System | No      | 540–600, 720–780       |
| C301 | Science Block C   | 20       | Whiteboard, Computers                              | No      | 660–720                |
| D005 | Design Block D    | 12       | Smart TV, Whiteboard                               | Yes     | 570–630                |

---

## Available Scripts

| Script                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                     |
| `npm run build`         | Type-check and build for production           |
| `npm run preview`       | Preview the production build locally          |
| `npm run typecheck`     | Run `tsc --noEmit` for type-only checking      |
| `npm test`              | Run the Vitest unit tests once                |
| `npm run test:watch`    | Run tests in watch mode                       |
| `npm run lint`          | Lint with ESLint                              |

---

## Notes

- This is a **read-only prototype**. No bookings are created, modified, or persisted.
- All data is fictional and in-memory; refreshing the page resets everything.
- Time inputs use **integer minutes after midnight** (0–1440). The UI shows a live `HH:MM` preview next to each field.
