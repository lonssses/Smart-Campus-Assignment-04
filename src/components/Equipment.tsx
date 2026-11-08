import { Wrench } from 'lucide-react';

export function EquipmentSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Wrench className="h-4 w-4" /> Required equipment
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
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
  );
}

export function EquipmentTags({ items }: { items: string[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
