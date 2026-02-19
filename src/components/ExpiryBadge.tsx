import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ExpiryBadge({ dday }: { dday: number }) {
  const label = dday < 0 ? `D+${Math.abs(dday)}` : dday === 0 ? 'D-Day' : `D-${dday}`;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-bold',
        dday < 0 && 'border-red-500 bg-red-50 text-red-600',
        dday === 0 && 'border-orange-500 bg-orange-50 text-orange-600',
        dday >= 1 && dday <= 3 && 'border-yellow-500 bg-yellow-50 text-yellow-600',
        dday > 3 && 'border-green-500 bg-green-50 text-green-600',
      )}
    >
      {label}
    </Badge>
  );
}
