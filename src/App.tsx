import { useMemo, useState } from 'react';
import {
  Clock,
  DoorClosed,
  CheckCircle2,
  XCircle,
  Users,
  Search,
} from 'lucide-react';
import {
  MAX_DURATION,
  MINUTES_PER_DAY,
  checkAvailability,
  minutesToTime,
  validateInputs,
  type AvailabilityResult,
  type Room,
} from '@/lib/availability';
import { filterRooms } from '@/lib/roomFilter';
import { EQUIPMENT_OPTIONS, NOW, ROOMS } from '@/data/roomData';
import { InfoCard } from '@/components/InfoCard';
import { TimeField } from '@/components/TimeField';
import { ResultBanner } from '@/components/ResultBanner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorList } from '@/components/ErrorList';
import { EquipmentSelector } from '@/components/Equipment';
import { RoomList } from '@/components/RoomList';
import { RoomDetails } from '@/components/RoomDetails';

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

  const startDisplay = useMemo(
    () => formatTimeDisplay(startNum),
    [startNum]
  );
  const endDisplay = useMemo(
    () => formatTimeDisplay(endNum),
    [endNum]
  );

  // F1 + F2: filter rooms by capacity and equipment.
  const matchingRooms = useMemo(
    () => filterRooms(ROOMS, attendeesNum, requiredEquipment),
    [attendeesNum, requiredEquipment]
  );

  const selectedRoom: Room | undefined = useMemo(
    () =>
      matchingRooms.find((r) => r.id === selectedRoomId) ??
      ROOMS.find((r) => r.id === selectedRoomId),
    [matchingRooms, selectedRoomId]
  );

  function clearResult() {
    setResult(null);
    setErrors([]);
  }

  // F5: when the selected room changes, clear the prior result.
  function handleRoomChange(id: string) {
    setSelectedRoomId(id);
    clearResult();
  }

  function handleCheckInputChange(value: string, setter: (v: string) => void) {
    setter(value);
    clearResult();
  }

  function toggleEquipment(item: string) {
    setRequiredEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
    clearResult();
  }

  function handleAttendeesChange(value: string) {
    setAttendees(value);
    clearResult();
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
            <EquipmentSelector
              options={EQUIPMENT_OPTIONS}
              selected={requiredEquipment}
              onToggle={toggleEquipment}
            />
          </div>
        </section>

        {/* Matching room list — F4 empty state */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <DoorClosed className="h-4 w-4" /> Matching Rooms
          </h2>
          {matchingRooms.length === 0 ? (
            <EmptyState
              title="No rooms match your filters."
              hint="Try lowering the attendee count or removing required equipment."
            />
          ) : (
            <RoomList
              rooms={matchingRooms}
              selectedRoomId={selectedRoomId}
              onSelect={handleRoomChange}
            />
          )}
        </section>

        {/* Selected room details */}
        {selectedRoom && <RoomDetails room={selectedRoom} />}

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
            <ErrorList errors={errors} />
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

// Shared display helper for start/end time fields.
function formatTimeDisplay(minutes: number): string {
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= MINUTES_PER_DAY
    ? minutesToTime(minutes)
    : '--:--';
}
