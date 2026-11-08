import type { ReactNode } from 'react';

export function ResultBanner({
  tone,
  icon,
  title,
  body,
}: {
  tone: 'success' | 'error';
  icon: ReactNode;
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
