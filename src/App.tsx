import { useMemo, useState } from 'react';
import {
  Clock,
  DoorClosed,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Wrench,
  Search,
  Ban,
} from 'lucide-react';
import {
  MAX_DURATION,
  MINUTES_PER_DAY,
  checkAvailability,
  filterRooms,
  minutesToTime,
  validateInputs,
  type AvailabilityResult,
  type Room,
} from '@/lib/availability';
import { EQUIPMENT_OPTIONS, NOW, ROOMS } from '@/data/roomData';

export default function App() {
  // --- Filter inputs ---
  const [attendees, setAttendees] = useState<string>('1');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);

  // --- Availability check inputs ---
  const [start, setStart] = useState<string>('660'); // 11:00 default
  const [end, setEnd] = useState<string>('720');     // 12:00 default
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // --- Results ---
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const startNum = Number(start);
  const endNum = Number(end);
  const attendeesNum = Math.max(0, Math.floor(Number(attendees) || 0));

  const startDisplay = useMemo(() => {
    return Number.isInteger(startNum) && startNum >= 0 && startNum <= MINUTES_PER_DAY
      ? minutesToTime(startNum)
      : '--:--';
  }, [startNum]);

  const endDisplay = useMemo(() => {
    return Number.isInteger(endNum) && startNum >= 0 && endNum >= 0 && endNum <= MINUTES_PER_DAY
      ? minutesToTime(endNum)
      : '--:--';
  }, [startNum, endNum]);

  // F1 + F2: filter rooms by capacity and equipment.
  const matchingRooms = useMemo(
    () => filterRooms(ROOMS, attendeesNum, requiredEquipment),
    [attendeesNum, requiredEquipment]
  );

  const selectedRoom: Room | undefined = useMemo(
    () => matchingRooms.find((r) => r.id === selectedRoomId) ??
      ROOMS.find((r) => r.id === selectedRoomId),
    [matchingRooms, selectedRoomId]
  );

  // F5: when the selected room changes, clear the prior result.
  function handleRoomChange(id: string) {
    setSelectedRoomId(id);
    setResult(null);
    setErrors([]);
  }

  // Any change to the check inputs should clear stale results.
  function handleCheckInputChange(value: string, setter: (v: string) => void) {
    setter(value);
    setResult(null);
    setErrors([]);
  }

  function toggleEquipment(item: string) {
    setRequiredEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
    setResult(null);
    setErrors([]);
  }

  function handleAttendeesChange(value: string) {
    setAttendees(value);
    setResult(null);
    setErrors([]);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedRoom) {
      setErrors(['Please select a room from the matching list first.']);
      setResult(null);
      return;
    }

    const validation = validateInputs(startNum, endNum, NOW);
    if (!validation.ok) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }

    setErrors([]);
    setResult(checkAvailability(selectedRoom, startNum, endNum));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Smart Campus Room Availability Checker
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Filter campus rooms by capacity and equipment, then check whether
            your chosen room is free for a requested time window. This is a
            read-only prototype — no bookings are created or saved.
          </p>
        </header>

        {/* Current time summary */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoCard
            icon={<Clock className="h-4 w-4" />}
            label="Current time"
            value={`${minutesToTime(NOW)} (${NOW} min)`}
          />
          <InfoCard
            icon={<Search className="h-4 w-4" />}
            label="Matching rooms"
            value={`${matchingRooms.length} of ${ROOMS.length} rooms`}
          />
        </section>

        {/* Filter section */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Filter Rooms</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Attendees */}
            <label htmlFor="attendees" className="block">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Users className="h-4 w-4" /> Attendees
              </span>
              <input
                id="attendees"
                type="number"
                inputMode="numeric"
                min={0}
                value={attendees}
                onChange={(e) => handleAttendeesChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Only rooms with capacity ≥ this number will be shown (F1).
              </span>
            </label>

            {/* Equipment */}
            <div>
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Wrench className="h-4 w-4" /> Required equipment
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((item) => {
                  const active = requiredEquipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <span className="mt-1 block text-xs text-slate-500">
                Rooms must have all selected items (F2).
              </span>
            </div>
          </div>
        </section>

        {/* Matching room list — F4 empty state */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <DoorClosed className="h-4 w-4" /> Matching Rooms
          </h2>

          {matchingRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <AlertTriangle className="mb-2 h-6 w-6 text-amber-500" />
              <p className="text-sm font-medium text-slate-700">No rooms match your filters.</p>
              <p className="mt-1 text-xs text-slate-500">
                Try lowering the attendee count or removing required equipment.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {matchingRooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => handleRoomChange(room.id)}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-800">
                            {room.name}
                          </span>
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
              })}
            </ul>
          )}
        </section>

        {/* Selected room details */}
        {selectedRoom && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <DoorClosed className="h-4 w-4" /> Selected Room Details
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard
                icon={<DoorClosed className="h-4 w-4" />}
                label="Room"
                value={`${selectedRoom.name} · ${selectedRoom.building}`}
              />
              <InfoCard
                icon={<Users className="h-4 w-4" />}
                label="Capacity"
                value={`${selectedRoom.capacity} people`}
              />
              <InfoCard
                icon={selectedRoom.blocked
                  ? <Ban className="h-4 w-4" />
                  : <CheckCircle2 className="h-4 w-4" />}
                label="Status"
                value={selectedRoom.blocked ? 'Blocked' : 'Open'}
              />
            </div>

            {/* Equipment */}
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Equipment
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {selectedRoom.equipment.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Bookings for this room only */}
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" /> Existing bookings today
              </div>
              {selectedRoom.bookings.length === 0 ? (
                <p className="text-sm text-slate-500">No existing bookings.</p>
              ) : (
                <ul className="space-y-1.5">
                  {selectedRoom.bookings.map((b, i) => (
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
              )}
            </div>
          </section>
        )}

        {/* Availability check form */}
        {selectedRoom && (
          <form
            onSubmit={handleCheck}
            noValidate
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Check Availability</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TimeField
                id="start"
                label="Start time (min after midnight)"
                value={start}
                onChange={(v) => handleCheckInputChange(v, setStart)}
                hint={`0–1440 · displays as ${startDisplay}`}
              />
              <TimeField
                id="end"
                label="End time (min after midnight)"
                value={end}
                onChange={(v) => handleCheckInputChange(v, setEnd)}
                hint={`0–1440 · displays as ${endDisplay}`}
              />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Rules: 0 ≤ start &lt; end ≤ 1440, start &gt; now ({NOW}), and
              duration ≤ {MAX_DURATION} min. Touching endpoints are allowed
              (e.g. ending at 660 when another booking starts at 660).
            </p>

            {errors.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">Please fix the following:</p>
                <ul className="mt-1 list-disc pl-5">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
            >
              Check Availability
            </button>
          </form>
        )}

        {/* Result */}
        {result && (
          <section className="mt-6">
            {result.available ? (
              <ResultBanner
                tone="success"
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Available"
                body={`The room is free from ${startDisplay} to ${endDisplay} (${endNum - startNum} min).`}
              />
            ) : (
              <ResultBanner
                tone="error"
                icon={<XCircle className="h-5 w-5" />}
                title="Unavailable"
                body={result.reason}
              />
            )}
            <p className="mt-2 text-xs text-slate-400">
              No bookings were created or modified — this is a read-only check.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function TimeField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={MINUTES_PER_DAY}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    </label>
  );
}

function ResultBanner({
  tone,
  icon,
  title,
  body,
}: {
  tone: 'success' | 'error';
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const styles =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-800';
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${styles}`}>
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm">{body}</p>
      </div>
    </div>
  );
}
