import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import ScreenLayout from '../components/ScreenLayout';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS, TRANSLATIONS, CATEGORY_IMAGES } from '../constants';
import { useApp } from '../AppContext';
import { Plus, Search, X } from 'lucide-react';
import Button from '../components/Button';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Product } from '../types';

export default function MarketplaceScreen() {
  const { language } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q') || '';
  
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [marketProducts, setMarketProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync searchQuery with URL param if it changes
  useEffect(() => {
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setMarketProducts(products);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const allProducts = [...marketProducts, ...MOCK_PRODUCTS];

  const filteredProducts = allProducts.filter(product => {
    const queryStr = searchQuery.toLowerCase();
    const name = product.title[language as keyof typeof product.title]?.toLowerCase() || '';
    const category = product.category.toLowerCase();
    
    // Apply URL category filter if present
    const categoryMatches = !categoryParam || product.category === categoryParam;
    
    return categoryMatches && (name.includes(queryStr) || category.includes(queryStr));
  });

  const clearCategoryFilter = () => {
    setSearchParams({});
  };

  return (
    <ScreenLayout title={categoryParam ? `${categoryParam}` : t.marketplace}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 rounded-3xl overflow-hidden h-40 relative shadow-lg">
          <img 
            src="/marketplace_banner.png"
            alt="Marketplace Header"
            className="w-full h-full object-cover rounded-[32px]"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <h2 className="text-white text-2xl font-black uppercase tracking-widest drop-shadow-md">
              {categoryParam || t.marketplace}
            </h2>
          </div>
        </div>

        {categoryParam && (
          <div className="flex items-center gap-2 mb-6 bg-bamboo-gold/10 p-3 rounded-2xl border border-bamboo-gold/20">
            <span className="text-xs font-bold text-bamboo-gold flex-1 px-1">Filtering by: {categoryParam}</span>
            <button 
              onClick={clearCategoryFilter}
              className="p-1.5 bg-white text-bamboo-gold rounded-xl shadow-sm hover:bg-bamboo-gold hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="SEARCH ALL HANDCRAFTED BAMBOO PRODUCTS"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border-none bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">{t.artisanMarket}</h2>
        <Button 
          size="sm" 
          className="gap-2 rounded-full"
          onClick={() => navigate('/list-product')}
        >
          <Plus size={16} />
          {t.sellProduct}
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse">{t.loadingDesigns || 'Loading amazing designs...'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard 
                product={product} 
                language={language} 
                onClick={(p) => navigate(`/product/${p.id}`)}
              />
            </motion.div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 py-10 text-center">
              <p className="text-gray-400 mb-6 font-medium">{t.noProductsFound}</p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-bamboo-gold/5 p-6 rounded-[2rem] border border-bamboo-gold/10"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bamboo-gold mx-auto mb-4 shadow-sm">
                  <Search size={22} />
                </div>
                <h3 className="text-sm font-bold text-bamboo-dark mb-2">{t.cantFindIt}</h3>
                <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                  {t.customCraftDesc}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/track-order')}
                  className="w-full bg-white border-bamboo-gold/20 text-bamboo-gold hover:bg-bamboo-gold hover:text-white transition-all font-bold text-xs mb-3"
                >
                  {t.trackOrder}
                </Button>
                <div className="pt-2 border-t border-bamboo-gold/10">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">{t.areYouArtisan}</p>
                  <button 
                    onClick={() => navigate('/material-tracker')}
                    className="text-[10px] font-black text-bamboo-dark hover:text-bamboo-gold transition-colors underline"
                  >
                    {t.trackMaterialNew}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
      </motion.div>
    </ScreenLayout>
  );
}
