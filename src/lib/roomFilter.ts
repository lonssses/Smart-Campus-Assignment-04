// ---------------------------------------------------------------------------
// Room filtering logic — separated from booking rules for single responsibility.
//
// F1: capacity >= requested attendees.
// F2: room has ALL required equipment items.
// Returns a new array; does not mutate the input.
// ---------------------------------------------------------------------------

import type { Room } from '@/lib/availability';

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
