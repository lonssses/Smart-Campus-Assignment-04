import { describe, it, expect } from 'vitest';
import { filterRooms } from '@/lib/roomFilter';
import { checkAvailability, type Room } from '@/lib/availability';
import { ROOMS } from '@/data/roomData';

// ---------------------------------------------------------------------------
// F1: capacity >= requested attendees
// ---------------------------------------------------------------------------
describe('F1 — capacity filtering', () => {
  it('includes a room whose capacity exactly equals the attendee count', () => {
    // B204 has capacity 30
    const result = filterRooms(ROOMS, 30, []);
    const b204 = result.find((r) => r.id === 'B204');
    expect(b204).toBeDefined();
  });

  it('excludes a room whose capacity is below the attendee count', () => {
    // B204 has capacity 30; request 31
    const result = filterRooms(ROOMS, 31, []);
    expect(result.find((r) => r.id === 'B204')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// F2: every selected equipment item must be present
// ---------------------------------------------------------------------------
describe('F2 — equipment filtering', () => {
  it('includes only rooms that have ALL required equipment', () => {
    const result = filterRooms(ROOMS, 1, ['Projector', 'Audio System']);
    // B204 has Projector + Audio System → included
    expect(result.find((r) => r.id === 'B204')).toBeDefined();
    // C301 has neither → excluded
    expect(result.find((r) => r.id === 'C301')).toBeUndefined();
  });

  it('excludes a room missing one of the required items', () => {
    // B204 has Projector + Whiteboard + Audio System but NOT Video Conferencing
    const result = filterRooms(ROOMS, 1, ['Projector', 'Video Conferencing']);
    expect(result.find((r) => r.id === 'B204')).toBeUndefined();
    // A110 has both → included
    expect(result.find((r) => r.id === 'A110')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// F3: blocked room cannot be reported Available
// ---------------------------------------------------------------------------
describe('F3 — blocked room never available', () => {
  it('returns unavailable for the blocked room (D005) on any time slot', () => {
    const blockedRoom = ROOMS.find((r) => r.blocked)!;
    expect(blockedRoom.id).toBe('D005');
    const result = checkAvailability(blockedRoom, 900, 960);
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reason).toContain('blocked');
    }
  });
});

// ---------------------------------------------------------------------------
// Filter does not mutate input
// ---------------------------------------------------------------------------
describe('filterRooms — no mutation', () => {
  it('returns a new array and does not mutate the input', () => {
    const before = JSON.stringify(ROOMS);
    const result = filterRooms(ROOMS, 20, ['Whiteboard']);
    expect(result).not.toBe(ROOMS); // different array reference
    expect(JSON.stringify(ROOMS)).toBe(before); // input unchanged
  });
});
