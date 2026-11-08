import { DoorClosed, Users, Ban, CheckCircle2 } from 'lucide-react';
import type { Room } from '@/lib/availability';
import { InfoCard } from '@/components/InfoCard';
import { EquipmentTags } from '@/components/Equipment';
import { BookingListSection } from '@/components/BookingList';

export function RoomDetails({ room }: { room: Room }) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <DoorClosed className="h-4 w-4" /> Selected Room Details
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoCard
          icon={<DoorClosed className="h-4 w-4" />}
          label="Room"
          value={`${room.name} · ${room.building}`}
        />
        <InfoCard
          icon={<Users className="h-4 w-4" />}
          label="Capacity"
          value={`${room.capacity} people`}
        />
        <InfoCard
          icon={
            room.blocked ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />
          }
          label="Status"
          value={room.blocked ? 'Blocked' : 'Open'}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Equipment</p>
        <EquipmentTags items={room.equipment} />
      </div>

      <BookingListSection bookings={room.bookings} />
    </section>
  );
}
