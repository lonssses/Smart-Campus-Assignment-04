import type { Room } from '@/lib/availability';

// ---------------------------------------------------------------------------
// Fictional example data for V2. No database, no backend, no external APIs.
// ---------------------------------------------------------------------------

// "now" is frozen at 09:00 for the prototype.
export const NOW: number = 540;

// Catalog of equipment items that rooms can have and users can require.
export const EQUIPMENT_OPTIONS: string[] = [
  'Projector',
  'Whiteboard',
  'Video Conferencing',
  'Smart TV',
  'Audio System',
  'Computers',
];

// Four fictional rooms with varied capacity, equipment, and bookings.
export const ROOMS: Room[] = [
  {
    id: 'B204',
    name: 'Room B204',
    building: 'Engineering Block B',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard', 'Audio System'],
    blocked: false,
    bookings: [
      { start: 600, end: 660, label: 'Linear Algebra lecture' },
      { start: 840, end: 900, label: 'Faculty meeting' },
    ],
  },
  {
    id: 'A110',
    name: 'Room A110',
    building: 'Arts Block A',
    capacity: 50,
    equipment: ['Projector', 'Video Conferencing', 'Smart TV', 'Audio System'],
    blocked: false,
    bookings: [
      { start: 540, end: 600, label: 'Film studies seminar' },
      { start: 720, end: 780, label: 'Guest lecture' },
    ],
  },
  {
    id: 'C301',
    name: 'Room C301',
    building: 'Science Block C',
    capacity: 20,
    equipment: ['Whiteboard', 'Computers'],
    blocked: false,
    bookings: [
      { start: 660, end: 720, label: 'Programming lab' },
    ],
  },
  {
    id: 'D005',
    name: 'Room D005',
    building: 'Design Block D',
    capacity: 12,
    equipment: ['Smart TV', 'Whiteboard'],
    blocked: true,
    bookings: [
      { start: 570, end: 630, label: 'Maintenance window' },
    ],
  },
];
