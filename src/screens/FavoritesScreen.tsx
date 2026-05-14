import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronRight } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS, MOCK_PRODUCTS } from '../constants';
import { motion } from 'motion/react';

export default function FavoritesScreen() {
  const navigate = useNavigate();
  const { language, favorites, toggleFavorite } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const favoriteProducts = MOCK_PRODUCTS.filter(p => favorites.includes(p.id));

  return (
    <ScreenLayout showNav={false} className="bg-gray-50">
      <div className="flex items-center gap-4 mb-6 pt-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t.favorites}</h1>
      </div>

      <div className="space-y-4 pb-12">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map((product) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={product.id} 
              className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
              onClick={() => navigate(`/design/${product.id}`)}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                <img src={product.image} alt={product.title.en} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{product.title[language]}</h3>
                <p className="text-amber-700 font-bold text-sm">₹{product.price}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="p-2 bg-pink-50 text-pink-500 rounded-full"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-gray-200">
            <Heart size={48} strokeWidth={1} />
            <p className="mt-4 font-bold text-sm tracking-widest uppercase">No favorites yet</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
