import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import ScreenLayout from '../components/ScreenLayout';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS, CATEGORY_IMAGES, TRANSLATIONS } from '../constants';
import { useApp } from '../AppContext';
import { ChevronLeft, Filter } from 'lucide-react';

export default function CategoryScreen() {
  const { id: categoryName } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const categoryProducts = MOCK_PRODUCTS.filter(
    (product) => product.category === categoryName
  );

  const categoryImage = categoryName ? CATEGORY_IMAGES[categoryName] : '';

  return (
    <ScreenLayout title={categoryName || 'Category'}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pb-20"
      >
        {/* Hero Header */}
        <div className="relative h-60 -mx-6 mb-8 overflow-hidden shadow-lg">
          <img 
            src={categoryImage || 'https://images.unsplash.com/photo-1593414220466-ec728bc09678?auto=format&fit=crop&q=80&w=1200'}
            alt={categoryName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-serif font-bold text-white mb-2">{categoryName}</h1>
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                {categoryProducts.length} {t.exclusiveDesigns}
              </p>
            </motion.div>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-8 left-8 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Filters and Search Summary? (Optional) */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="h-px flex-1 bg-bamboo-gold/20" />
          <span className="px-4 text-[10px] text-bamboo-gold font-black uppercase tracking-[0.3em]">
            {t.artisanGrid}
          </span>
          <div className="h-px flex-1 bg-bamboo-gold/20" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-6 px-1">
          {categoryProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard 
                product={product} 
                language={language}
                onClick={(p) => navigate(`/product/${p.id}`)}
              />
            </motion.div>
          ))}
        </div>

        {categoryProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">{t.noProductsFound}</p>
          </div>
        )}

        {/* Bottom Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 bg-bamboo-ivory rounded-[3rem] text-center border border-bamboo-gold/10"
        >
          <h3 className="text-lg font-serif font-bold text-bamboo-dark mb-3">{t.customRequests}</h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {t.customCraftDesc}
          </p>
          <button 
            onClick={() => navigate('/chatbot')}
            className="w-full py-4 bg-bamboo-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-bamboo-gold transition-all"
          >
            {t.contactArtisanStudio}
          </button>
        </motion.div>
      </motion.div>
    </ScreenLayout>
  );
}
