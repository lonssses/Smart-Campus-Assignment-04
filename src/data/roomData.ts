import type { Booking, Room } from '@/lib/availability';

// ---------------------------------------------------------------------------
// Fictional example data for V1. No database, no backend, no external APIs.
// ---------------------------------------------------------------------------

// "now" is frozen at 09:00 for the prototype.
export const NOW: number = 540;

export const ROOM: Room = {
  name: 'Room B204',
  building: 'Engineering Block B',
  blocked: false,
};

// One existing booking: 10:00–11:00.
export const EXISTING_BOOKINGS: Booking[] = [
  { start: 600, end: 660, label: 'Linear Algebra lecture' },
];
