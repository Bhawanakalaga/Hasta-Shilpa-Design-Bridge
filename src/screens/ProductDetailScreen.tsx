import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  Hammer, 
  Package, 
  ListChecks, 
  IndianRupee, 
  Share2, 
  Heart,
  ZoomIn,
  Calculator,
  Download,
  Info
} from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { MOCK_PRODUCTS, TRANSLATIONS } from '../constants';
import { useApp } from '../AppContext';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, addToCart, favorites, toggleFavorite, showNotification } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const product = MOCK_PRODUCTS.find(p => p.id === id);
  const [showCalculator, setShowCalculator] = useState(false);
  const [labourHours, setLabourHours] = useState('10');
  const [hourlyWage, setHourlyWage] = useState('150');
  const [materialCost, setMaterialCost] = useState(product?.costPrice?.toString() || '0');

  if (!product) return <div>Product not found</div>;

  const isFavorite = favorites.includes(product.id);
  const suggestedPrice = (parseInt(materialCost) || 0) + (parseInt(labourHours) || 0) * (parseInt(hourlyWage) || 0);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title[language] || product.title.en,
          text: product.description[language] || product.description.en,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      showNotification('Share feature not supported', 'error');
    }
  };

  return (
    <ScreenLayout showNav={false} className="bg-bamboo-ivory">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="pb-32"
      >
        <div className="flex items-center justify-between gap-4 mb-6 px-4 pt-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-bamboo-dark/60 hover:bg-bamboo-gold/10 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-serif font-bold text-bamboo-dark">{t.productDetail}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleFavorite(product.id)}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              isFavorite ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-white text-bamboo-dark/30 hover:text-red-500 border border-bamboo-gold/10"
            )}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-white text-bamboo-rich border border-bamboo-gold/10 rounded-2xl hover:bg-bamboo-gold/5 transition-all shadow-sm"
            title={t.share}
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Hero Image / Technical Preview */}
      <div className="px-4 mb-8">
        <div 
          onClick={() => navigate(`/blueprint/${product.id}`)}
          className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-bamboo-dark/10 ring-1 ring-bamboo-gold/5 group cursor-zoom-in"
        >
          <img 
            src={product.image} 
            alt={product.title[language]} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-full text-bamboo-dark shadow-xl">
              <ZoomIn size={24} />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 bg-bamboo-gold/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
            Tap for Technical Blueprint
          </div>
        </div>
      </div>

      <div className="px-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
           <span className="px-3 py-1 bg-bamboo-gold/10 text-bamboo-gold text-[10px] font-black rounded-lg uppercase tracking-wider">{product.category}</span>
           <span className="px-3 py-1 bg-bamboo-dark/5 text-bamboo-dark/40 text-[10px] font-bold rounded-lg uppercase tracking-wider">{product.measurements}</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-bamboo-dark mb-3 leading-tight">{product.title[language] || product.title.en}</h2>
        <p className="text-bamboo-dark/60 leading-relaxed font-medium">{product.description[language] || product.description.en}</p>
      </div>

      {/* Dashboard Section */}
      <div className="px-4 grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-5 rounded-[2.5rem] border border-bamboo-gold/10 shadow-sm">
            <span className="block text-[10px] font-bold text-bamboo-dark/30 uppercase tracking-[0.2em] mb-2">{t.cost}</span>
            <span className="text-2xl font-bold text-bamboo-dark">₹{product.costPrice}</span>
        </div>
        <div className="bg-bamboo-dark p-5 rounded-[2.5rem] shadow-xl shadow-bamboo-dark/10">
            <span className="block text-[10px] font-bold text-bamboo-gold uppercase tracking-[0.2em] mb-2">{t.selling}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">₹{product.price}</span>
              <span className="text-[10px] text-green-400 font-bold">+{Math.round(((product.price - product.costPrice)/product.costPrice)*100)}%</span>
            </div>
        </div>
      </div>

      {/* Artisan Specifics */}
      <div className="px-4 space-y-8">
        {/* Dynamic Calculator Tool */}
        <section className="bg-gradient-to-br from-bamboo-gold/10 to-bamboo-gold/5 p-8 rounded-[3rem] border border-bamboo-gold/10">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-bold text-bamboo-dark flex items-center gap-3">
                <Calculator size={20} className="text-bamboo-gold" />
                Price Estimator
              </h3>
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-[10px] font-black text-bamboo-gold uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm"
              >
                {showCalculator ? "Hide" : "Customize"}
              </button>
           </div>

           <div className="space-y-4">
              
              <AnimatePresence>
                {showCalculator && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="bg-white/50 p-4 rounded-2xl backdrop-blur-sm border border-bamboo-gold/5">
                      <label className="text-[9px] font-black text-bamboo-gold uppercase block mb-2 px-1">Material Cost (₹)</label>
                      <input 
                        type="number" 
                        value={materialCost}
                        onChange={(e) => setMaterialCost(e.target.value)}
                        className="w-full bg-white border border-bamboo-gold/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-bamboo-gold/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-bamboo-gold uppercase block mb-2 px-1">Labour Hours</label>
                        <input 
                          type="number" 
                          value={labourHours}
                          onChange={(e) => setLabourHours(e.target.value)}
                          className="w-full bg-white border border-bamboo-gold/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-bamboo-gold/20"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-bamboo-gold uppercase block mb-2 px-1">Wage / Hr</label>
                        <input 
                          type="number" 
                          value={hourlyWage}
                          onChange={(e) => setHourlyWage(e.target.value)}
                          className="w-full bg-white border border-bamboo-gold/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-bamboo-gold/20"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center bg-bamboo-gold p-5 rounded-3xl shadow-lg shadow-bamboo-gold/20">
                 <div>
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest block mb-1">Suggested Selling Price</span>
                    <span className="text-2xl font-black text-white">₹{suggestedPrice}</span>
                 </div>
                 <div className="bg-white/20 p-2 rounded-xl text-white">
                    <IndianRupee size={24} />
                 </div>
              </div>

              <div className="flex items-start gap-2 bg-bamboo-gold/5 p-3 rounded-xl">
                 <Info size={14} className="text-bamboo-gold shrink-0 mt-0.5" />
                 <p className="text-[9px] text-bamboo-dark/50 font-medium leading-relaxed italic">Formula: Material Cost + (Labour Hours × Labour Wage). Adjust these based on your region's market rates.</p>
              </div>
           </div>
        </section>

        <section>
          <h3 className="font-serif text-xl font-bold text-bamboo-dark mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-bamboo-gold/10 rounded-xl flex items-center justify-center text-bamboo-gold">
              <Package size={22} strokeWidth={1.5} />
            </div>
            {t.materials}
          </h3>
          <ul className="grid grid-cols-1 gap-3">
            {product.materials.map((m, i) => (
              <li key={i} className="bg-white px-5 py-4 rounded-2xl text-sm font-medium text-bamboo-dark/70 border border-bamboo-gold/5 flex items-center justify-between shadow-sm">
                {m}
                <ChevronRight size={14} className="text-bamboo-gold/30" />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-serif text-xl font-bold text-bamboo-dark mb-4 flex items-center gap-3">
             <div className="w-10 h-10 bg-bamboo-gold/10 rounded-xl flex items-center justify-center text-bamboo-gold">
               <Hammer size={22} strokeWidth={1.5} />
             </div>
             {t.tools}
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tools.map((tool, i) => (
              <span key={i} className="bg-white text-bamboo-dark font-bold px-6 py-3 rounded-2xl text-xs border border-bamboo-gold/10 shadow-sm hover:border-bamboo-gold transition-colors">
                {tool}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-serif text-xl font-bold text-bamboo-dark mb-4 flex items-center gap-3">
             <div className="w-10 h-10 bg-bamboo-gold/10 rounded-xl flex items-center justify-center text-bamboo-gold">
               <ListChecks size={22} strokeWidth={1.5} />
             </div>
             {t.instructions}
          </h3>
          <div className="space-y-4">
            {product.steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <span className="w-8 h-8 bg-bamboo-dark text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-lg group-hover:bg-bamboo-gold transition-colors duration-500">
                  {i + 1}
                </span>
                <div className="flex-1 bg-white p-6 rounded-[2rem] border border-bamboo-gold/5 shadow-sm group-hover:shadow-md transition-all">
                  <p className="text-sm text-bamboo-dark/70 leading-relaxed font-medium">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-bamboo-ivory/80 backdrop-blur-xl border-t border-bamboo-gold/10 z-30">
        <div className="max-w-md mx-auto flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 py-5 rounded-2xl border-2 border-bamboo-gold text-bamboo-gold font-black uppercase text-[10px] tracking-wider hover:bg-bamboo-gold/5 bg-white"
            onClick={() => navigate(`/blueprint/${product.id}`)}
          >
            <Download size={16} className="mr-2" />
            Blueprint
          </Button>
          <Button 
            className="flex-[1.5] py-5 rounded-2xl bg-bamboo-rich hover:bg-black shadow-xl shadow-bamboo-rich/20 text-white font-black uppercase text-[10px] tracking-widest"
            onClick={() => {
              addToCart(product);
              showNotification(t.addToCart, 'success');
            }}
          >
            Add to Basket • ₹{product.price}
          </Button>
        </div>
      </div>
      {/* Spacer for bottom nav */}
      <div className="h-28" />
      </motion.div>
    </ScreenLayout>
  );
}
