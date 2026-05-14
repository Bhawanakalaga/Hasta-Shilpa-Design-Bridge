import { cn } from '../lib/utils';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Heart, ShoppingBag } from 'lucide-react';
import { useApp } from '../AppContext';

interface ProductCardProps {
  product: Product;
  language: Language;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, language, onClick }: ProductCardProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const { favorites, toggleFavorite, addToCart, showNotification } = useApp();
  const isFavorite = favorites.includes(product.id);
  
  return (
    <div 
      className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-bamboo-gold/5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 cursor-pointer relative group"
    >
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={cn(
            "p-2.5 rounded-2xl backdrop-blur-md transition-all duration-300",
            isFavorite ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-white/80 text-bamboo-dark/30 hover:text-red-500 border border-bamboo-gold/10"
          )}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
        </button>
      </div>
      <div onClick={() => onClick(product)}>
        <div className="aspect-[4/5] overflow-hidden bg-white relative">
          <img 
            src={product.image || "/bamboo_cane_lounge_chair.jpg"} 
            alt={product.title[language]} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/bamboo_cane_lounge_chair.jpg";
            }}
          />
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[8px] font-black text-bamboo-dark uppercase tracking-widest border border-bamboo-gold/20 shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              100% Eco
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-bamboo-gold">{product.category}</p>
            <span className="text-[9px] font-black text-bamboo-dark/20 uppercase">HS-{product.id.padStart(4, '0')}</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-bamboo-dark line-clamp-1">{product.title[language] || product.title.en}</h3>
          
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-bamboo-dark">₹{product.price}</span>
          </div>
          
          <div className="mt-4 flex flex-col gap-3">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 addToCart(product);
                 showNotification(t.addToCart, 'success');
               }}
               className="w-full py-3 bg-bamboo-gold text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-bamboo-rich transition-all flex items-center justify-center gap-2 shadow-lg shadow-bamboo-gold/10"
             >
               <ShoppingBag size={14} />
               {t.addToCart}
             </button>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-bamboo-dark/30 uppercase tracking-tighter">{product.measurements}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
