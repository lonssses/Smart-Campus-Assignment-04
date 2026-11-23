# Project memory

## Product intent & audience

- Smart Campus Room Availability Checker — student submits time, attendees, equipment needs; app shows matching rooms and whether a specific room is available.
- Originated as Assignment #04; now in Assignment #05 (read-only baseline task).
- Audience: course graders and student developer; expects clear report-style output with tables.

## Brand personality & voice

- Report-oriented, factual, A2 English — simple sentences, tables for structure.
- No marketing tone; student-assignment register.

## Visual design & UX direction

- React + TypeScript SPA, Tailwind CSS styling, lucide-react icons.
- Component structure: `RoomList` (selectable), `RoomDetails` panel, `EquipmentSelector` toggle filters, `TimeField` numeric HH:MM input, `InfoCard` stats, `ResultBanner` success/error, `EmptyState` (F4), `ErrorList` validation.
- Interactions: selecting room shows details; changing room/attendees/equipment clears prior result (`clearResult()` pattern in `App.tsx`).

## Decisions, constraints & rationale

- Domain logic kept pure in `src/lib/` (`availability.ts`, `roomFilter.ts`) for testability; UI in `src/components/`; static sample data in `src/data/roomData.ts` with frozen `NOW = 540`.
- Key acceptance criteria (AC2–AC5, F1) have automated test coverage — must remain correct.
- Tests: vitest + @testing-library/react + jsdom; 25 tests across 3 files.
- Scripts: `dev`, `build`, `lint` (eslint .), `typecheck` (tsc --noEmit), `test` (vitest run), `test:watch`, `preview`.

## Open questions & assumptions

- Known lint failures (4 unused imports) unresolved — `App.test.tsx`, `RoomList.tsx`, `availability.test.ts`, `roomFilter.test.ts`.
- `@supabase/supabase-js` in dependencies but unused in `src/` — remove or wire up?
- No F3 UI-level integration test (blocked room D005 unavailable in UI).
- No test for filter-change clearing results (attendees/equipment triggers).
- `AGENTS.md` not present; `README.md` exists (108 lines).
- Git not accessible in workspace; baseline commit unknown — check GitHub directly.