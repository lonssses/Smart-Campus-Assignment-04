import { DoorClosed, Users, Ban } from 'lucide-react';
import type { Room } from '@/lib/availability';

export function RoomListItem({
  room,
  isSelected,
  onSelect,
}: {
  room: Room;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(room.id)}
        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
          isSelected
            ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
            : 'border-slate-200 bg-white hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-800">{room.name}</span>
            <span className="ml-2 text-xs text-slate-500">{room.building}</span>
          </div>
          {room.blocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              <Ban className="h-3 w-3" /> Blocked
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> Capacity: {room.capacity}
          </span>
          <span>{room.equipment.length} equipment items</span>
        </div>
      </button>
    </li>
  );
}

export function RoomList({
  rooms,
  selectedRoomId,
  onSelect,
}: {
  rooms: Room[];
  selectedRoomId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {rooms.map((room) => (
        <RoomListItem
          key={room.id}
          room={room}
          isSelected={room.id === selectedRoomId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
