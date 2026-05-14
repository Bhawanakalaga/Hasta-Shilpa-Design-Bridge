import { Home, User, Calculator, Store, Hammer } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BottomNavProps {
  language: Language;
}

export default function BottomNav({ language }: BottomNavProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const navItems = [
    { to: '/home', icon: Home, label: t.home },
    { to: '/marketplace', icon: Store, label: t.marketplace },
    { to: '/material-tracker', icon: Hammer, label: t.materialTracker },
    { to: '/price-calculator', icon: Calculator, label: t.priceCalculator },
    { to: '/profile', icon: User, label: t.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bamboo-ivory/95 backdrop-blur-xl border-t border-bamboo-gold/10 px-1 py-3 flex items-center z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] sm:px-4">
      <div className="flex w-full max-w-md mx-auto justify-between px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center py-2 px-1 rounded-2xl transition-all duration-300 min-w-[64px]",
                isActive 
                  ? "text-bamboo-gold bg-bamboo-dark scale-105 shadow-md border border-bamboo-gold/20" 
                  : "text-bamboo-dark/40 hover:text-bamboo-dark/60"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={cn(
                  "text-[8px] uppercase tracking-[0.1em] mt-1 font-bold transition-all duration-300",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 scale-75"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
