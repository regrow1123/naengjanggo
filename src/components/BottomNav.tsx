'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ChefHat, ShoppingCart, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/fridge', icon: Refrigerator, label: '냉장고' },
  { href: '/recipes', icon: ChefHat, label: '레시피' },
  { href: '/planner', icon: CalendarDays, label: '식단' },
  { href: '/shopping', icon: ShoppingCart, label: '장보기' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // 로그인/회원가입 페이지에서는 네비 숨김
  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-md">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors',
                active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
