import { useMemo, useState } from 'react';
import { Clock, DoorClosed, CalendarDays, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
  MAX_DURATION,
  MINUTES_PER_DAY,
  checkAvailability,
  minutesToTime,
  validateInputs,
  type AvailabilityResult,
} from '@/lib/availability';
import { EXISTING_BOOKINGS, NOW, ROOM } from '@/data/roomData';

export default function App() {
  const [start, setStart] = useState<string>('660'); // 11:00 default
  const [end, setEnd] = useState<string>('720');     // 12:00 default
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const startNum = Number(start);
  const endNum = Number(end);

  const startDisplay = useMemo(() => {
    return Number.isInteger(startNum) && startNum >= 0 && startNum <= MINUTES_PER_DAY
      ? minutesToTime(startNum)
      : '--:--';
  }, [startNum]);
  const endDisplay = useMemo(() => {
    return Number.isInteger(endNum) && endNum >= 0 && endNum <= MINUTES_PER_DAY
      ? minutesToTime(endNum)
      : '--:--';
  }, [endNum]);

  function handleInputChange(value: string, setter: (v: string) => void) {
    setter(value);
    // Clear any previous result/errors so a stale Available/Unavailable banner
    // is never shown for newly edited values until a fresh check is performed.
    setResult(null);
    setErrors([]);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateInputs(startNum, endNum, NOW);
    if (!validation.ok) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }
    setErrors([]);
    setResult(checkAvailability(ROOM, EXISTING_BOOKINGS, startNum, endNum));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Smart Campus Room Availability Checker
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Check whether a room is free for a requested time window. This is a
            read-only prototype — no bookings are created or saved.
          </p>
        </header>

        {/* Room + current time summary */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoCard icon={<DoorClosed className="h-4 w-4" />} label="Selected room" value={`${ROOM.name} · ${ROOM.building}`} />
          <InfoCard icon={<Clock className="h-4 w-4" />} label="Current time" value={`${minutesToTime(NOW)} (${NOW} min)`} />
          <InfoCard icon={<AlertTriangle className="h-4 w-4" />} label="Room status" value={ROOM.blocked ? 'Blocked' : 'Open'} />
        </section>

        {/* Existing bookings */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <CalendarDays className="h-4 w-4" /> Existing bookings today
          </div>
          {EXISTING_BOOKINGS.length === 0 ? (
            <p className="text-sm text-slate-500">No existing bookings.</p>
          ) : (
            <ul className="space-y-2">
              {EXISTING_BOOKINGS.map((b, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>{b.label ?? 'Booking'}</span>
                  <span className="font-mono text-slate-700">
                    {minutesToTime(b.start)}–{minutesToTime(b.end)}
                    <span className="ml-2 text-slate-400">({b.start}–{b.end})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Check form */}
        <form onSubmit={handleCheck} noValidate className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TimeField
              id="start"
              label="Start time (min after midnight)"
              value={start}
              onChange={(v) => handleInputChange(v, setStart)}
              hint={`0–1440 · displays as ${startDisplay}`}
            />
            <TimeField
              id="end"
              label="End time (min after midnight)"
              value={end}
              onChange={(v) => handleInputChange(v, setEnd)}
              hint={`0–1440 · displays as ${endDisplay}`}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Rules: 0 ≤ start &lt; end ≤ 1440, start &gt; now ({NOW}), and duration ≤ {MAX_DURATION} min.
            Touching endpoints are allowed (e.g. ending at 660 when another booking starts at 660).
          </p>

          {errors.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Please fix the following:</p>
              <ul className="mt-1 list-disc pl-5">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
