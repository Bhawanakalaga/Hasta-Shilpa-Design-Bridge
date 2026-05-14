import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ScreenLayout from '../components/ScreenLayout';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';
import { MOCK_PRODUCTS, TRANSLATIONS, CATEGORIES, CATEGORY_IMAGES } from '../constants';
import { useApp } from '../AppContext';
import { 
  Search, 
  Loader2, 
  ChevronLeft, 
  Armchair, 
  Laptop, 
  Lamp, 
  Box, 
  Utensils, 
  ShoppingBag, 
  Lightbulb, 
  Leaf, 
  Home as HomeIcon, 
  Trees,
  Hammer,
  Calculator,
  IndianRupee,
  ChevronRight
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'Modern Furniture': Armchair,
  'Work & Tech': Laptop,
  'Lighting & Decor': Lamp,
  'Home Decor & Storage': Box,
  'Kitchen & Dining': Utensils,
  'Fashion & Accessories': ShoppingBag,
  'Creative & Innovative': Lightbulb,
  'Eco-Friendly': Leaf,
  'Architecture': HomeIcon,
  'Garden & Outdoor': Trees
};


export default function HomeScreen() {
  const { language } = useApp();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out "All" from the list for the main grid
  const activeFeatures = CATEGORIES.filter(c => c !== 'All');
  
  // Trending products (just pick a few from mock)
  const trendingProducts = MOCK_PRODUCTS.slice(0, 5);

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  return (
    <ScreenLayout title={t.home}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="pb-10"
      >
        {/* Search Bar */}
        <div className="relative mb-10 group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={20} strokeWidth={2} className="text-bamboo-gold transition-transform group-focus-within:scale-110" />
          </div>
          <input
            type="text"
            placeholder={t.searchPlaceholder || "Search masterworks, blueprints, or artisans..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="block w-full pl-14 pr-6 py-5 border-none bg-white rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] ring-1 ring-bamboo-gold/5 focus:ring-4 focus:ring-bamboo-gold/10 outline-none text-base transition-all placeholder:text-bamboo-dark/30 font-medium"
          />
        </div>

        {/* Welcome & Philosophy */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 border-l-4 border-bamboo-gold pl-6 py-2"
        >
          <span className="text-[10px] text-bamboo-gold font-black uppercase tracking-[0.4em] mb-3 block">Since 2026</span>
          <h2 className="text-4xl font-serif font-bold text-bamboo-dark leading-tight tracking-tight">
            {t.modernVision || "Modern Vision"}. <br/>
            <span className="text-bamboo-gold italic">{t.artisanCrafted || "Artisan Crafted"}.</span>
          </h2>
        </motion.div>



        {/* Value Proposition Grid */}
        <div className="grid grid-cols-3 gap-4 mb-20 px-2 lg:px-0">
          {[
            { icon: Leaf, title: t.ecoFriendly || 'Eco-Friendly', desc: t.ecoFriendlyDesc || 'Sustainable bamboo' },
            { icon: Hammer, title: t.artisanCrafted || 'Artisan Crafted', desc: t.artisanCraftedDesc || '500+ makers' },
            { icon: Lightbulb, title: t.modernVision || 'Modern Vision', desc: t.modernVisionDesc || 'Urban homes' }
          ].map((item, idx) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-bamboo-gold/10 flex items-center justify-center text-bamboo-gold mb-3 group-hover:scale-110 group-hover:bg-bamboo-gold group-hover:text-white transition-all duration-500">
                <item.icon size={20} />
              </div>
              <h4 className="text-[10px] font-black text-bamboo-dark uppercase tracking-widest mb-1 leading-tight">{item.title}</h4>
              <p className="text-[8px] text-gray-400 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Category Bento Grid */}
        <div className="space-y-10 mb-20">
          <div className="flex items-end justify-between px-2">
            <div>
              <span className="text-[10px] text-bamboo-gold font-black uppercase tracking-widest mb-1 block">{t.explorerLabel || "Explorer"}</span>
              <h2 className="text-3xl font-serif font-bold text-bamboo-dark tracking-tight">{t.designLibrary || "Design Library"}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 lg:gap-8">
            {activeFeatures.map((category, index) => {
              const Icon = CATEGORY_ICONS[category] || Box;
              // Modified Bento Logic for professional alignment
              // Row 0: Full (0)
              // Row 1: Half (1, 2)
              // Row 2: Half (3, 4)
              // Row 3: Full (5)
              // Row 4: Half (6, 7)
              // Row 5: Half (8, 9)
              const isFullWidth = index === 0 || index === 5;
              
              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: (index % 4) * 0.1,
                    duration: 0.8,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    "group relative overflow-hidden rounded-[3rem] shadow-sm ring-1 ring-bamboo-gold/5 text-left transition-all hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2",
                    isFullWidth ? "col-span-2 h-80" : "h-64"
                  )}
                >
                  <img 
                    src={CATEGORY_IMAGES[category]} 
                    alt={category}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bamboo-dark/95 via-bamboo-dark/20 to-transparent transition-opacity duration-700" />
                  
                  {isFullWidth ? (
                    <div className="absolute inset-0 flex flex-col justify-end p-10">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-2xl">
                          <Icon size={28} />
                        </div>
                        <div className="h-px flex-1 bg-white/20" />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-white mb-2 drop-shadow-2xl">{category}</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-bamboo-gold" />
                        <p className="text-[10px] text-bamboo-gold font-black uppercase tracking-[0.3em]">
                          {MOCK_PRODUCTS.filter(p => p.category === category).length} {t.blueprintsAvailable || "Blueprints Available"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-8 right-8">
                        <div className="w-12 h-12 rounded-[1.2rem] bg-white/10 backdrop-blur-lg flex items-center justify-center text-white border border-white/20 transition-all duration-700 group-hover:bg-bamboo-gold group-hover:text-white group-hover:rotate-[15deg]">
                          <Icon size={20} />
                        </div>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-lg font-serif font-bold text-white leading-tight mb-2 drop-shadow-xl group-hover:translate-x-2 transition-transform duration-500">{category}</h3>
                        <p className="text-[10px] text-bamboo-gold font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                          {MOCK_PRODUCTS.filter(p => p.category === category).length} {t.designs || "Designs"}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ 
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)' 
                  }} />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Vision Section: The Design Bridge */}
        <div className="mb-20 overflow-hidden">
          <div className="bg-bamboo-rich rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bamboo-gold/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-bamboo-gold/10 rounded-full blur-3xl -ml-10 -mb-10" />
            
            <div className="relative z-10 text-center">
              <span className="text-[10px] text-bamboo-gold font-black uppercase tracking-[0.4em] mb-4 block">{t.visionLabel || "Our Vision"}</span>
              <h2 className="text-3xl font-serif font-bold text-white mb-6 leading-tight">{t.designBridgeTitle || "The Design Bridge"}</h2>
              <p className="text-sm text-white/50 font-medium leading-relaxed max-w-[280px] mx-auto mb-10">
                {t.designBridgeDesc || "Connecting Western Ghat artisans with modern urban design to keep traditional crafts relevant in the 21st century."}
              </p>
              
              <div className="flex justify-center items-center gap-10">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-white mb-1">500+</div>
                  <div className="text-[9px] text-bamboo-gold font-black uppercase tracking-widest">{t.artisansCount || "Artisans"}</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-white mb-1">1.2k</div>
                  <div className="text-[9px] text-bamboo-gold font-black uppercase tracking-widest">{t.designsCount || "Designs"}</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-white mb-1">100%</div>
                  <div className="text-[9px] text-bamboo-gold font-black uppercase tracking-widest">{t.ecoLabel || "Eco"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Poetic Footer Signature */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 mb-10 py-10 border-t border-bamboo-gold/10 text-center"
        >
          <div className="flex justify-center mb-6">
            <span className="w-1 h-1 rounded-full bg-bamboo-gold mx-1" />
            <span className="w-1 h-1 rounded-full bg-bamboo-gold mx-1 opacity-50" />
            <span className="w-1 h-1 rounded-full bg-bamboo-gold mx-1 opacity-25" />
          </div>
          <p className="font-serif italic text-bamboo-dark/40 text-sm max-w-[200px] mx-auto leading-relaxed mb-4">
            {t.poeticFooter || '"Bridging the roots of tradition with the wings of modern design."'}
          </p>
          <span className="text-[9px] font-black text-bamboo-gold uppercase tracking-[0.4em]">Hasta-Shilpa</span>
        </motion.div>
      </motion.div>
    </ScreenLayout>
  );
}
