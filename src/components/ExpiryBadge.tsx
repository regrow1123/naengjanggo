import { cn } from '@/lib/utils';

export default function ExpiryBadge({ dday }: { dday: number }) {
  const label = dday < 0 ? `D+${Math.abs(dday)}` : dday === 0 ? 'D-Day' : `D-${dday}`;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold',
        dday < 0 && 'bg-red-100 text-red-600',
        dday === 0 && 'bg-orange-100 text-orange-600 animate-pulse',
        dday >= 1 && dday <= 3 && 'bg-yellow-100 text-yellow-600',
        dday > 3 && dday <= 7 && 'bg-green-100 text-green-600',
        dday > 7 && 'bg-gray-100 text-gray-500',
      )}
    >
      {label}
    </span>
  );
}
