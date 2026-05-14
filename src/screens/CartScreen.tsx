import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Button from '../components/Button';

export default function CartScreen() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, language } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <ScreenLayout title={t.cart}>
        <div className="flex flex-col items-center justify-center py-32 text-center px-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-32 h-32 bg-gradient-to-br from-bamboo-gold/20 to-bamboo-gold/5 rounded-[3rem] flex items-center justify-center mb-10 relative"
          >
            <div className="absolute inset-0 bg-bamboo-gold/10 rounded-[3rem] blur-2xl animate-pulse" />
            <ShoppingBag size={56} strokeWidth={1} className="text-bamboo-gold relative z-10" />
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-bamboo-rich text-white p-2 rounded-xl shadow-lg ring-4 ring-bamboo-ivory"
            >
              <Sparkles size={16} />
            </motion.div>
          </motion.div>
          <h2 className="text-2xl font-serif font-bold text-bamboo-dark mb-3">Your Collection is Waiting</h2>
          <p className="text-sm text-bamboo-dark/40 font-medium leading-relaxed mb-10">Explore our curated marketplace to find unique bamboo masterworks that resonate with your soul.</p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="px-10 py-4 bg-bamboo-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-bamboo-dark/20 hover:bg-bamboo-gold transition-colors"
          >
            Discover Designs
          </button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={`${t.cart} (${cart.length})`}>
      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4">
            <img 
              src={item.image} 
              alt={item.title[language]} 
              className="w-20 h-20 rounded-xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{item.title[language]}</h3>
                <p className="text-amber-700 font-bold">₹{item.price}</p>
              </div>
               <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                   <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-gray-400 hover:text-red-500">
                     <Minus size={16} />
                   </button>
                   <span className="font-bold text-sm">{item.quantity}</span>
                   <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-gray-400 hover:text-amber-700">
                     <Plus size={16} />
                   </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400">
                   <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-gray-100 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center text-gray-500">
          <span>{t.items}</span>
          <span>{cart.length}</span>
        </div>
        <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">
          <span>{t.total}</span>
          <span className="text-amber-700">₹{total}</span>
        </div>
        <Button 
          className="w-full py-4 text-lg mt-4" 
          onClick={() => navigate('/checkout')}
        >
          {t.checkout}
        </Button>
      </div>
    </ScreenLayout>
  );
}
