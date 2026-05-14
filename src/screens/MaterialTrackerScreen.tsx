import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Minus, Trash2, ChevronDown, History as HistoryIcon, Calendar, Info, IndianRupee, Layers } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS, MOCK_PRODUCTS } from '../constants';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { addDoc, collection, query, orderBy, onSnapshot, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  productName: string;
  bambooCount: number;
  caneLength: number;
  cost: number;
  date: string;
  createdAt: string;
}

export default function MaterialTrackerScreen() {
  const navigate = useNavigate();
  const { language, showNotification } = useApp();
  const t = (TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en) as any;

  const [selectedProductId, setSelectedProductId] = useState('global');
  const [bambooCount, setBambooCount] = useState('');
  const [caneLength, setCaneLength] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'material_tracking'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      setHistory(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const setPositiveValue = (setter: (v: string) => void, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num < 0) return;
    setter(val);
  };

  const totalCost = ((parseFloat(bambooCount) || 0) + (parseFloat(caneLength) || 0)) * (parseFloat(unitCost) || 0);

  const handleLogHistory = async () => {
    if (!bambooCount && !caneLength) return;
    
    let productName = 'General Inventory';
    if (selectedProductId !== 'global') {
      if (selectedProductId === 'custom') {
        productName = (window as any)._customCraftName || 'Custom Craft';
      } else {
        productName = MOCK_PRODUCTS.find(p => p.id === selectedProductId)?.title[language] || MOCK_PRODUCTS.find(p => p.id === selectedProductId)?.title.en || 'Unknown';
      }
    }

    const newLog = {
      productName,
      bambooCount: parseFloat(bambooCount) || 0,
      caneLength: parseFloat(caneLength) || 0,
      cost: totalCost,
      date: new Date().toLocaleString(),
      userId: auth.currentUser?.uid,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'material_tracking'), newLog);
      setBambooCount('');
      setCaneLength('');
      setUnitCost('');
      showNotification(t.stockAdded || 'Log saved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'material_tracking');
    }
  };

  const removeHistoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'material_tracking', id));
      showNotification('Log entry removed');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'material_tracking');
    }
  };

  return (
    <ScreenLayout showNav={true} className="bg-[var(--color-bamboo-ivory)]">
      {/* Header Panel */}
      <div className="bg-[var(--color-bamboo-dark)] pt-12 pb-16 px-6 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-bamboo-gold)] opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/10 rounded-2xl text-[var(--color-bamboo-gold)] backdrop-blur-md border border-white/5 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif text-[var(--color-bamboo-gold)] leading-tight">{t.materialTracker}</h1>
            <p className="text-[var(--color-bamboo-gold)] opacity-60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Inventory & Production Logs</p>
          </div>
          <div className="p-3 bg-[var(--color-bamboo-gold)]/10 rounded-2xl">
            <Layers className="text-[var(--color-bamboo-gold)] w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 space-y-6 relative z-20 pb-24">
        {/* Project Selection */}
        <div className="premium-card p-5 rounded-3xl border border-[var(--color-bamboo-gold)]/10">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Tracking Domain</label>
          <div className="relative">
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 appearance-none focus:ring-2 focus:ring-[var(--color-bamboo-gold)] outline-none font-bold text-gray-700 shadow-inner"
            >
              <option value="global">General Stock</option>
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.title[language as keyof typeof p.title] || p.title.en}</option>
              ))}
              <option value="custom">+ New Custom Work</option>
            </select>
            <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-bamboo-gold)] pointer-events-none" />
          </div>
          
          <AnimatePresence>
            {selectedProductId === 'custom' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <input 
                  type="text" 
                  placeholder="E.g. Hand-painted bamboo screen"
                  className="w-full bg-white border border-[var(--color-bamboo-gold)]/30 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-[var(--color-bamboo-gold)] outline-none shadow-sm"
                  onChange={(e) => {
                    (window as any)._customCraftName = e.target.value;
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quantities Card */}
        <div className="premium-card p-6 rotate-container rounded-[2.5rem] bg-white border-b-4 border-[var(--color-bamboo-gold)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-serif font-black text-[var(--color-bamboo-dark)] flex items-center gap-2">
              <Package size={18} className="text-[var(--color-bamboo-gold)]" />
              Log Materials
            </h3>
            <div className="p-2 bg-gray-50 rounded-lg">
               <Info size={14} className="text-gray-400" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t.bamboo} Count</label>
                <input 
                  type="number" 
                  value={bambooCount}
                  onChange={(e) => setPositiveValue(setBambooCount, e.target.value)}
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl px-5 py-4 text-xl font-black text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t.cane} Meters</label>
                <input 
                  type="number" 
                  value={caneLength}
                  onChange={(e) => setPositiveValue(setCaneLength, e.target.value)}
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl px-5 py-4 text-xl font-black text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Estimated Unit Cost</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-bamboo-gold)]" />
                <input 
                  type="number" 
                  value={unitCost}
                  onChange={(e) => setPositiveValue(setUnitCost, e.target.value)}
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl pl-12 pr-5 py-4 text-lg font-bold text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <AnimatePresence>
              {totalCost > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-[var(--color-bamboo-dark)] rounded-2xl flex justify-between items-center shadow-lg"
                >
                  <span className="text-xs font-bold text-[var(--color-bamboo-gold)]">{t.totalCost || 'Est. Total Value'}</span>
                  <span className="text-xl font-black text-[var(--color-bamboo-gold)] font-mono">₹{totalCost.toLocaleString()}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={!bambooCount && !caneLength}
              onClick={handleLogHistory}
              className="w-full mt-2 py-5 bg-[var(--color-bamboo-gold)] text-[var(--color-bamboo-dark)] rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[var(--color-bamboo-gold)]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              Log Entry
            </button>
          </div>
        </div>

        {/* Usage History */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-serif text-[var(--color-bamboo-dark)] flex items-center gap-2">
              <HistoryIcon size={20} className="text-[var(--color-bamboo-gold)]" />
              {t.stockHistory || 'History'}
            </h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{history.length} Entries</span>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : history.length === 0 ? (
                <div className="premium-card rounded-[2.5rem] p-10 flex flex-col items-center text-center opacity-60">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <Calendar size={28} className="text-gray-300" />
                   </div>
                   <p className="text-sm font-serif text-gray-500">No logs discovered yet.<br/>Start tracking to see them here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="premium-card p-5 rounded-[2rem] border-l-4 border-l-[var(--color-bamboo-gold)] group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-[var(--color-bamboo-dark)] p-2.5 rounded-xl">
                          <Package size={18} className="text-[var(--color-bamboo-gold)]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[var(--color-bamboo-dark)] uppercase tracking-tight">{item.productName}</h3>
                          <p className="text-[10px] text-gray-400 font-bold">{item.date}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeHistoryItem(item.id)}
                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {item.bambooCount > 0 && (
                          <div className="bg-[var(--color-bamboo-dark)]/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-black/5 whitespace-nowrap">
                            <div className="w-1.5 h-1.5 bg-[var(--color-bamboo-gold)] rounded-full" />
                            <span className="text-[10px] font-black text-[var(--color-bamboo-dark)]">{item.bambooCount} {t.bamboo}</span>
                          </div>
                        )}
                        {item.caneLength > 0 && (
                          <div className="bg-[var(--color-bamboo-dark)]/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-black/5 whitespace-nowrap">
                            <div className="w-1.5 h-1.5 bg-[var(--color-bamboo-gold)] rounded-full" />
                            <span className="text-[10px] font-black text-[var(--color-bamboo-dark)]">{item.caneLength}m {t.cane}</span>
                          </div>
                        )}
                      </div>
                      {item.cost > 0 && (
                        <div className="px-3 py-1.5 bg-green-50 rounded-xl border border-green-100">
                          <span className="text-xs font-black text-green-700">₹{item.cost.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
}
