import { CalendarDays } from 'lucide-react';
import { minutesToTime, type Booking } from '@/lib/availability';

export function BookingList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-slate-500">No existing bookings.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {bookings.map((b, i) => (
        <li
          key={i}
          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
        >
          <span>{b.label ?? 'Booking'}</span>
          <span className="font-mono text-slate-700">
            {minutesToTime(b.start)}–{minutesToTime(b.end)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BookingListSection({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        <CalendarDays className="h-3.5 w-3.5" /> Existing bookings today
      </div>
      <BookingList bookings={bookings} />
    </div>
  );
}
