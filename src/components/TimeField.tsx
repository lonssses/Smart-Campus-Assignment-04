import { MINUTES_PER_DAY } from '@/lib/availability';

export function TimeField({
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
