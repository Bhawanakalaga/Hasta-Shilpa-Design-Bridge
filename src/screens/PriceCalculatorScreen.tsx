import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calculator, IndianRupee, History, Save, Trash2, Tag, Clock, Wallet, ChevronRight } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Button from '../components/Button';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { addDoc, collection, query, orderBy, onSnapshot, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface PriceHistory {
  id: string;
  productName: string;
  materials: number;
  hours: number;
  wage: number;
  result: number;
  createdAt: any;
}

export default function PriceCalculatorScreen() {
  const navigate = useNavigate();
  const { language, showNotification } = useApp();
  const t = (TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en) as any;

  const [productName, setProductName] = useState('');
  const [materials, setMaterials] = useState('');
  const [hours, setHours] = useState('');
  const [wage, setWage] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'price_history'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PriceHistory[];
      setHistory(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const calculate = () => {
    if (!materials || !hours || !wage) {
      showNotification(t.errorFillAll || 'Please fill essential costs', 'error');
      return;
    }

    const m = Math.max(0, parseFloat(materials) || 0);
    const h = Math.max(0, parseFloat(hours) || 0);
    const w = Math.max(0, parseFloat(wage) || 0);

    const suggested = Math.ceil(m + (h * w));
    setResult(suggested);
    showNotification(t.priceCalculated || 'Calculation Ready');
  };

  const saveToHistory = async () => {
    if (result === null) return;
    
    try {
      await addDoc(collection(db, 'price_history'), {
        userId: auth.currentUser?.uid,
        productName: productName || 'Untitled Craft',
        materials: parseFloat(materials),
        hours: parseFloat(hours),
        wage: parseFloat(wage),
        result: result,
        createdAt: serverTimestamp()
      });
      showNotification(t.priceSaved || 'Saved to history');
      setProductName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'price_history');
    }
  };

  const deleteHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'price_history', id));
      showNotification('Entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'price_history');
    }
  };

  const setPositiveValue = (setter: (v: string) => void, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num < 0) return;
    setter(val);
  };

  return (
    <ScreenLayout showNav={true} className="bg-[var(--color-bamboo-ivory)]">
      {/* Header */}
      <div className="bg-[var(--color-bamboo-dark)] pt-12 pb-20 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/10 rounded-2xl text-[var(--color-bamboo-gold)] border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-[var(--color-bamboo-gold)]">{t.priceCalculator}</h1>
            <p className="text-[var(--color-bamboo-gold)] opacity-60 text-[10px] font-bold uppercase tracking-widest">Market Value Estimator</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 space-y-6 pb-24 relative z-20">
        <div className="premium-card p-6 rounded-[2.5rem] border-b-4 border-[var(--color-bamboo-gold)] shadow-xl">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                <Tag size={10} /> {t.productName || 'Project Name'}
              </label>
              <input
                className="w-full bg-gray-50/50 border border-transparent rounded-2xl p-4 text-sm font-bold text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all shadow-inner"
                placeholder="E.g. Traditional Bamboo Vase"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                <Wallet size={10} /> {t.materialCost} (₹)
              </label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-bamboo-gold)]" />
                <input
                  type="number"
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all shadow-inner"
                  placeholder="0"
                  value={materials}
                  onChange={(e) => setPositiveValue(setMaterials, e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Clock size={10} /> {t.laborHours}
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl p-4 text-lg font-black text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all shadow-inner"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setPositiveValue(setHours, e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Calculator size={10} /> {t.wagePerHour} (₹)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl p-4 text-lg font-black text-[var(--color-bamboo-dark)] focus:bg-white focus:border-[var(--color-bamboo-gold)] outline-none transition-all shadow-inner"
                  placeholder="0"
                  value={wage}
                  onChange={(e) => setPositiveValue(setWage, e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full py-5 rounded-2xl bg-[var(--color-bamboo-dark)] text-[var(--color-bamboo-gold)] font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform" 
              onClick={calculate}
            >
              <Calculator size={18} />
              {t.calculate} Summary
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {result !== null && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="p-8 bg-gradient-to-br from-[var(--color-bamboo-dark)] to-[#0a2e1f] rounded-[2.5rem] text-center text-white border border-[var(--color-bamboo-gold)]/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-bamboo-gold)] opacity-5 pointer-events-none" />
              
              <span className="text-[var(--color-bamboo-gold)] uppercase tracking-[0.2em] text-[10px] font-black mb-4 block opacity-80">
                {t.calculatedPrice || 'ESTIMATED SELLING PRICE'}
              </span>
              <div className="text-6xl font-black flex items-center justify-center gap-2 text-[var(--color-bamboo-gold)] font-serif mb-6 drop-shadow-lg">
                <span className="text-3xl opacity-80">₹</span>
                {result.toLocaleString()}
              </div>
              
              <button 
                onClick={saveToHistory}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-bamboo-gold)] text-[var(--color-bamboo-dark)] rounded-full text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
                <Save size={14} />
                {t.saveToHistory || 'Save to History'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="w-full py-4 border-2 border-[var(--color-bamboo-gold)]/20 text-[var(--color-bamboo-dark)] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
        >
          <History size={16} className="text-[var(--color-bamboo-gold)]" />
          {showHistory ? 'Close Repository' : 'View Pricing History'}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {loading ? (
                <div className="text-center py-10 opacity-30">Fetching Archive...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-serif">Your pricing archive is empty.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="premium-card p-5 rounded-3xl border-l-4 border-l-[var(--color-bamboo-gold)] flex justify-between items-center group">
                    <div>
                      <h4 className="text-sm font-black text-[var(--color-bamboo-dark)] uppercase leading-tight">{item.productName}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">₹{item.materials} Mat • {item.hours}h Labor</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-black text-[var(--color-bamboo-dark)]">₹{item.result}</div>
                        <p className="text-[8px] text-gray-300 font-black uppercase">{item.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}</p>
                      </div>
                      <button 
                        onClick={() => deleteHistory(item.id)}
                        className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScreenLayout>
  );
}
