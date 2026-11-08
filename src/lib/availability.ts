// ---------------------------------------------------------------------------
// Smart Campus Room Availability Checker — core logic (V2)
//
// All logic is pure and easy to inspect. No state, no side effects, no I/O.
// Fictional example data is defined in src/data/roomData.ts.
//
// V2 additions: Room gains id/capacity/equipment and a bookings array;
// filterRooms implements F1 (capacity) and F2 (equipment). The original
// validateInputs / overlaps / checkAvailability functions are unchanged in
// behavior — checkAvailability now takes bookings from the Room object.
// ---------------------------------------------------------------------------

export interface Booking {
  start: number; // integer minutes after midnight
  end: number;   // integer minutes after midnight
  label?: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: string };

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120; // AC2: maximum booking duration in minutes

// Convert integer minutes after midnight to a readable "HH:MM" string.
export function minutesToTime(minutes: number): string {
  const m = Math.max(0, Math.min(MINUTES_PER_DAY, Math.round(minutes)));
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

// AC1: validate raw start/end inputs against the integer-minute rules.
//   - both must be integers
//   - 0 <= start < end <= 1440
//   - start > now
// AC2: end - start <= 120 (exactly 120 allowed)
export function validateInputs(
  startRaw: number,
  endRaw: number,
  now: number
): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(startRaw)) {
    errors.push('Start time must be a whole number of minutes.');
  }
  if (!Number.isInteger(endRaw)) {
    errors.push('End time must be a whole number of minutes.');
  }
  if (errors.length) return { ok: false, errors };

  if (startRaw < 0) {
    errors.push('Start time must not be less than 0 minutes.');
  }
  if (startRaw > MINUTES_PER_DAY) {
    errors.push('Start time must not be greater than 1440 minutes.');
  }
  if (endRaw < 0) {
    errors.push('End time must not be less than 0 minutes.');
  }
  if (endRaw > MINUTES_PER_DAY) {
    errors.push('End time must not be greater than 1440 minutes.');
  }
  if (startRaw >= endRaw) {
    errors.push('Start time must be earlier than end time.');
  }
  if (startRaw <= now) {
    errors.push('Start time must be later than the current time.');
  }

  const duration = endRaw - startRaw;
  if (duration > MAX_DURATION) {
    errors.push(
      `Maximum booking duration is ${MAX_DURATION} minutes (you requested ${duration}).`
    );
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

// Two bookings overlap if they share any inner span. Touching endpoints
// (e.g. 600–660 and 660–720) are allowed, so we use strict inequalities.
function overlaps(a: Booking, b: Booking): boolean {
  return a.start < b.end && b.start < a.end;
}

// F1: capacity >= requested attendees.
// F2: room has ALL required equipment items.
// F3: blocked rooms are excluded from filtered results (and separately
//     enforced in checkAvailability so a blocked room is never "available").
// Returns a new array; does not mutate the input.
export function filterRooms(
  rooms: Room[],
  attendees: number,
  requiredEquipment: string[]
): Room[] {
  return rooms.filter((room) => {
    if (room.capacity < attendees) return false;
    if (requiredEquipment.length === 0) return true;
    return requiredEquipment.every((item) => room.equipment.includes(item));
  });
}

// AC3 + AC4 + AC5: check a validated request against a single room's bookings.
// The room's bookings are read only — nothing is added, removed, or mutated.
export function checkAvailability(
  room: Room,
  start: number,
  end: number
): AvailabilityResult {
  if (room.blocked) {
    return { available: false, reason: 'This room is currently blocked and cannot be booked.' };
  }
  const request: Booking = { start, end };
  const conflict = room.bookings.find((b) => overlaps(b, request));
  if (conflict) {
    return {
      available: false,
      reason: `Overlaps an existing booking (${minutesToTime(conflict.start)}–${minutesToTime(conflict.end)}).`,
    };
  }
  return { available: true };
}
