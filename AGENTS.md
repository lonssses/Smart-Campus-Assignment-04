# AGENTS.md — Agent Instructions

Smart Campus Room Availability Checker — Software Engineering Assignment #05.

This file tells any AI agent (or human contributor) what the project is, how it is built, what rules must be preserved, and what actions are allowed or forbidden.

---

## 1. Project Purpose and Scope

The Smart Campus Room Availability Checker is a **read-only web prototype**. A user enters a number of attendees, selects required equipment, picks a room from the filtered list, and enters a start and end time. The app reports whether that room is available for the requested time window.

**Scope:**
- Check availability against fictional, in-memory booking data.
- Filter rooms by capacity and equipment.
- Show clear validation errors and availability results.

**Out of scope:**
- Creating, editing, or deleting bookings.
- Saving data to a database or file.
- User accounts or authentication.
- Real-time clock updates ("now" is frozen at 09:00).

---

## 2. Architecture Overview

The project separates domain logic (pure functions), data, and UI into distinct folders.

```
src/
  main.tsx                        React entry point — renders <App />
  App.tsx                         Main screen — state, layout, event handlers
  lib/
    availability.ts               Domain types + booking rules (AC1–AC5)
    roomFilter.ts                 Room filtering by capacity and equipment (F1–F2)
  data/
    roomData.ts                   Fictional rooms, equipment catalog, frozen NOW = 540
  components/
    RoomList.tsx                  Selectable list of matching rooms
    RoomDetails.tsx               Details panel for the selected room
    Equipment.tsx                 Equipment filter toggles + display tags
    BookingList.tsx               Existing bookings list
    TimeField.tsx                 Numeric time input with HH:MM hint
    InfoCard.tsx                  Small stat card
    ResultBanner.tsx              Available / Unavailable banner
    EmptyState.tsx                "No rooms match" message (F4)
    ErrorList.tsx                 Validation error list
  __tests__/
    App.test.tsx                  4 UI and integration tests
  lib/__tests__/
    availability.test.ts          15 unit tests for AC1–AC5
    roomFilter.test.ts            6 unit tests for F1–F3
  test/
    setup.ts                      Test setup — jest-dom matchers
```

**Key principle:** Domain logic lives in `src/lib/` as pure functions with no side effects. This makes the rules easy to test without rendering React components. UI components in `src/components/` are small and focused — each does one thing. `App.tsx` holds the state and wires everything together.

---

## 3. Setup and Verified Commands

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Install dependencies

```bash
npm install
```

### Commands

All commands below were verified during the Task 1 baseline (2026-11-23):

| Command | Purpose | Verified result |
|---------|---------|-----------------|
| `npm run dev` | Start the Vite development server with hot reload | Not run in baseline (blocked in this environment) |
| `npm run build` | Build for production into `dist/` | Pass — 1580 modules, built in 2.13s, exit 0 |
| `npm run test` | Run all Vitest tests once | Pass — 25/25 tests, 0 failures, exit 0 |
| `npm run test:watch` | Run tests in watch mode | Not run in baseline |
| `npm run typecheck` | Run `tsc --noEmit` for type checking | Pass — no errors, exit 0 |
| `npm run lint` | Run ESLint over the project | **Fail — 4 unused-import errors, exit 1** |
| `npm run preview` | Serve the production build locally | Not run in baseline |

### Known lint failures (do not fix without approval)

The following 4 lint errors exist in the baseline and must not be fixed in Task 2:

| File | Line | Unused import |
|------|------|---------------|
| `src/__tests__/App.test.tsx` | 2 | `fireEvent` |
| `src/components/RoomList.tsx` | 1 | `DoorClosed` |
| `src/lib/__tests__/availability.test.ts` | 10 | `NOW` |
| `src/lib/__tests__/roomFilter.test.ts` | 3 | `Room` |

---

## 4. Coding Conventions

- **TypeScript strict mode** is enabled (`tsconfig.app.json`). All function parameters must have explicit types.
- **Path alias:** Use `@/` to import from `src/` (e.g. `import { Room } from '@/lib/availability'`). Do not use deep relative paths like `../../lib/availability`.
- **Pure functions first:** Domain logic in `src/lib/` must have no state, no side effects, and no I/O. Do not import React or UI code into `src/lib/`.
- **Single responsibility:** Each component in `src/components/` does one thing. Do not add unrelated logic to an existing component.
- **No comments unless necessary:** Only add a comment when the reason for the code is not obvious from the names. Do not write comments that just describe what the code does.
- **Small, focused changes:** One change per task. Do not refactor unrelated code in the same change. Do not rename files or functions unless the task requires it.
- **Fictional data only:** All room and booking data is hardcoded in `src/data/roomData.ts`. Do not add real personal data or external data sources.
- **Icons:** Use `lucide-react` for icons. Do not install other icon libraries.

---

## 5. Testing Requirements

### Existing test suite

The project has 25 tests across 3 files. All must pass before and after any change.

| Test file | Tests | Covers |
|-----------|-------|--------|
| `src/lib/__tests__/availability.test.ts` | 15 | AC1–AC5 + `minutesToTime` |
| `src/lib/__tests__/roomFilter.test.ts` | 6 | F1–F3 + non-mutation |
| `src/__tests__/App.test.tsx` | 4 | F4, F5, 2 integration tests |

### Acceptance criteria that must remain correct

These rules have automated test coverage. Any change that breaks them is a regression.

| ID | Rule | Tested in |
|----|------|-----------|
| AC1 | Times must be whole numbers; `0 ≤ start < end ≤ 1440`; `start > now` | `availability.test.ts` |
| AC2 | Duration must not exceed 120 minutes; exactly 120 is allowed, 121 is rejected | `availability.test.ts` |
| AC3 | A blocked room is always unavailable, even on a free slot | `availability.test.ts`, `roomFilter.test.ts` |
| AC4 | Touching endpoints are allowed; overlapping bookings are rejected | `availability.test.ts` |
| AC5 | Checking availability does not modify the room or its bookings | `availability.test.ts` |
| F1 | A room is shown only if `capacity ≥ attendees` | `roomFilter.test.ts` |
| F2 | A room is shown only if it has all selected equipment items | `roomFilter.test.ts` |
| F3 | A blocked room can never be reported as available | `roomFilter.test.ts` |
| F4 | An empty-state message is shown when no rooms match | `App.test.tsx` |
| F5 | Changing the selected room clears the previous result | `App.test.tsx` |

### Before making a change

1. Run `npm run test` and confirm 25/25 pass.
2. Make the change.
3. Run `npm run test` again and confirm 25/25 still pass.
4. Run `npm run typecheck` and confirm no errors.
5. Report the actual test numbers — do not say "tests pass" without showing the real output.

---

## 6. Allowed Actions

An agent may do the following:

- **Inspect code:** Read any file in the project to understand structure, logic, and tests.
- **Run safe local checks:** Execute `npm run test`, `npm run build`, `npm run typecheck`, and `npm run lint` to verify the project state.
- **Propose focused changes:** Suggest specific edits to files within the approved scope. Show what would change and why.
- **Show diffs:** Display the exact lines that would be added or removed before applying them.
- **Write or edit AGENTS.md:** This file may be updated to keep instructions accurate.

---

## 7. Forbidden Actions

An agent must **not** do the following:

| Forbidden action | Reason |
|------------------|--------|
| Access secrets or environment variables | No secrets are needed for this read-only prototype |
| Use real personal data | All data must remain fictional |
| Deploy to production | This is a student prototype, not a production app |
| Run destructive commands (`rm -rf`, `git reset --hard`, `DROP TABLE`) | These can destroy work irreversibly |
| Install new dependencies without approval | Changes `package.json` and `package-lock.json` unexpectedly |
| Add unrelated features | The scope is availability checking only |
| Modify files outside the approved scope | Each task defines which files may be changed |
| Fix lint errors without explicit approval | The 4 known lint errors are tracked separately |
| Modify `README.md` or `package.json` without approval | These are configuration files that require review |
| Change the acceptance criteria (AC1–AC5, F1–F5) | These rules are fixed by the assignment |
| Add a database or backend | The project uses static fictional data by design |

---

## 8. Human Approval Checkpoints

An agent must stop and ask for approval before:

| Action | When to ask |
|--------|-------------|
| Editing any source file | Before writing the change, show what will be edited and why |
| Installing a new dependency | Before running `npm install <package>` |
| Upgrading an existing dependency | Before changing any version in `package.json` |
| Merging changes | Before combining work into the main version |
| Deploying | Before any deployment, even to a preview environment |
| Deleting a file | Before removing any file, confirm it is not needed |
| Changing scope | Before working on anything outside the current task's approved files |

An agent must never apply a change silently. Always state what will change, wait for approval, then apply.

---

## 9. Reporting Requirements

After completing a task, an agent must report:

| Report item | Detail required |
|-------------|-----------------|
| Actual test results | Show the real `npm run test` output — file count, test count, pass/fail numbers |
| Type check results | Show whether `npm run typecheck` passed or failed |
| Build results | Show whether `npm run build` succeeded or failed |
| Lint results | Show whether `npm run lint` passed or failed, and list any errors |
| Changed files | List every file that was created, edited, or deleted, with the exact path |
| Remaining limitations | State anything that was not fixed, not tested, or left incomplete |
| Unverified claims | Clearly mark anything that could not be checked from the available files |

Do not claim a check passed if it was not run. Do not invent test numbers. If a command could not be executed, say so.

---

## 10. Preservation Rules

The following must not change unless the assignment explicitly requires it:

- **AC1–AC5:** The availability-checking rules (validation, max duration, blocked rooms, overlap detection, no mutation).
- **F1–F5:** The filtering rules (capacity, equipment, blocked handling, empty state, result clearing).
- **Fictional data:** The four rooms in `src/data/roomData.ts` and the frozen `NOW = 540`.
- **Read-only scope:** The app checks availability only. It does not create, edit, or persist bookings.
- **Pure domain logic:** `src/lib/availability.ts` and `src/lib/roomFilter.ts` must remain free of side effects.
