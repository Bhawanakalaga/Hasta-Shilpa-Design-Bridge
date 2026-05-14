import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from './BottomNav';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';
import { TRANSLATIONS } from '../constants';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNav?: boolean;
  className?: string;
}

export default function ScreenLayout({ children, title, showNav = true, className }: ScreenLayoutProps) {
  const { language, cart } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen bg-bamboo-ivory flex flex-col", className)}>
      {title && (
        <header className="sticky top-0 bg-bamboo-ivory/80 backdrop-blur-md border-b border-bamboo-gold/10 px-6 py-5 z-40 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-bamboo-dark tracking-tight">{title}</h1>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chatbot')}
              className="group relative p-3 bg-bamboo-dark text-bamboo-gold rounded-2xl shadow-lg border border-bamboo-gold/30 hover:border-bamboo-gold transition-all duration-500 hover:shadow-bamboo-gold/20"
              title="Artisan AI Guide"
            >
              <Bot size={20} strokeWidth={2} className="opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cart')}
              className="relative p-3 bg-bamboo-dark text-bamboo-gold rounded-2xl shadow-lg border border-bamboo-gold/30 hover:border-bamboo-gold transition-all duration-500 hover:shadow-bamboo-gold/20"
              title={t.cart}
            >
              <ShoppingCart size={20} strokeWidth={2} />
              <AnimatePresence mode="popLayout">
                {cart.length > 0 && (
                  <motion.span 
                    key="cart-badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-bamboo-gold text-white text-[9px] font-black flex items-center justify-center rounded-full shadow-lg ring-2 ring-white px-1 leading-none"
                  >
                    <motion.span
                      key={cart.reduce((total, item) => total + item.quantity, 0)}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </motion.span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </header>
      )}
      <main className={cn("flex-1 px-5 pb-32 pt-4", !title && "pt-8")}>
        {children}
      </main>
      {showNav && <BottomNav language={language} />}
    </div>
  );
}
