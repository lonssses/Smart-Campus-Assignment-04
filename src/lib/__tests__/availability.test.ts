import { describe, it, expect } from 'vitest';
import {
  validateInputs,
  checkAvailability,
  minutesToTime,
  MINUTES_PER_DAY,
  MAX_DURATION,
  type Room,
} from '@/lib/availability';
import { NOW, ROOMS } from '@/data/roomData';

const NOW_VAL = 540; // 09:00 — fixed per assignment

// ---------------------------------------------------------------------------
// AC1: valid/invalid times, start equal to now, day boundaries
// ---------------------------------------------------------------------------
describe('AC1 — validateInputs', () => {
  it('accepts valid times within bounds and start > now', () => {
    expect(validateInputs(600, 660, NOW_VAL)).toEqual({ ok: true });
  });

  it('rejects non-integer start time', () => {
    const r = validateInputs(600.5, 660, NOW_VAL);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toHaveLength(1);
  });

  it('rejects start equal to now', () => {
    const r = validateInputs(540, 600, NOW_VAL);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain('Start time must be later than the current time.');
    }
  });

  it('rejects start < 0', () => {
    const r = validateInputs(-10, 600, NOW_VAL);
    expect(r.ok).toBe(false);
  });

  it('rejects end > 1440 (day boundary)', () => {
    const r = validateInputs(600, 1441, NOW_VAL);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain('End time must not be greater than 1440 minutes.');
    }
  });

  it('rejects start >= end', () => {
    const r = validateInputs(600, 600, NOW_VAL);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain('Start time must be earlier than end time.');
    }
  });
});

// ---------------------------------------------------------------------------
// AC2: exactly 120 minutes allowed and 121 rejected
// ---------------------------------------------------------------------------
describe('AC2 — maximum duration', () => {
  it('allows exactly 120 minutes', () => {
    expect(validateInputs(600, 720, NOW_VAL)).toEqual({ ok: true });
  });

  it('rejects 121 minutes', () => {
    const r = validateInputs(600, 721, NOW_VAL);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.includes(`${MAX_DURATION}`))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// AC3: blocked rooms are unavailable
// ---------------------------------------------------------------------------
describe('AC3 — blocked rooms', () => {
  it('returns unavailable for a blocked room even with a free slot', () => {
    const blockedRoom = ROOMS.find((r) => r.blocked)!;
    const result = checkAvailability(blockedRoom, 900, 960);
    expect(result.available).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC4: touching endpoints allowed, overlapping rejected
// ---------------------------------------------------------------------------
describe('AC4 — overlap and touching endpoints', () => {
  const room = ROOMS.find((r) => r.id === 'B204')!; // bookings: 600–660, 840–900

  it('allows a request that ends exactly when a booking starts (touching)', () => {
    // 540–600 touches the 600–660 booking at 600
    expect(checkAvailability(room, 550, 600).available).toBe(true);
  });

  it('allows a request that starts exactly when a booking ends (touching)', () => {
    // 660–720 starts where the 600–660 booking ends
    expect(checkAvailability(room, 660, 720).available).toBe(true);
  });

  it('rejects a request that overlaps a booking', () => {
    // 630–690 overlaps 600–660
    const result = checkAvailability(room, 630, 690);
    expect(result.available).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC5: booking data remains unchanged after checking availability
// ---------------------------------------------------------------------------
describe('AC5 — no mutation of booking data', () => {
  it('does not modify the room or its bookings array after a check', () => {
    const room: Room = {
      id: 'TEST',
      name: 'Test Room',
      building: 'Test',
      capacity: 10,
      equipment: [],
      blocked: false,
      bookings: [
        { start: 600, end: 660, label: 'Test booking' },
      ],
    };
    const bookingsBefore = JSON.stringify(room.bookings);
    const blockedBefore = room.blocked;
    const capacityBefore = room.capacity;

    checkAvailability(room, 700, 760);

    expect(JSON.stringify(room.bookings)).toBe(bookingsBefore);
    expect(room.blocked).toBe(blockedBefore);
    expect(room.capacity).toBe(capacityBefore);
    expect(room.bookings).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// minutesToTime sanity
// ---------------------------------------------------------------------------
describe('minutesToTime', () => {
  it('converts 540 to 09:00', () => {
    expect(minutesToTime(540)).toBe('09:00');
  });

  it('clamps to day bounds', () => {
    expect(minutesToTime(MINUTES_PER_DAY)).toBe('00:00');
  });
});
