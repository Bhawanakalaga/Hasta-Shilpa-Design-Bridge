import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, MapPin, Clock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function TrackOrderScreen() {
  const navigate = useNavigate();
  const { language, lastOrderId } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  const [orderId, setOrderId] = useState(lastOrderId || '');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      // 1. Try to find in Firestore
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        const data = orderDoc.data();
        const createdAt = data.createdAt?.toDate() || new Date();
        const elapsedMs = Date.now() - createdAt.getTime();
        const elapsedHours = elapsedMs / (1000 * 60 * 60);

        // Map Firestore order to tracking data
        let status = t.statusPlaced;
        let statusIndex = 0;
        
        if (elapsedHours > 48) {
          status = t.statusDelivered;
          statusIndex = 3;
        } else if (elapsedHours > 24) {
          status = t.statusShipped;
          statusIndex = 2;
        } else if (elapsedHours > 2) {
          status = t.statusProcessing;
          statusIndex = 1;
        }

        setTrackingData({
          id: orderId,
          status,
          statusIndex,
          items: data.items?.length || 1,
          eta: new Date(createdAt.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          location: statusIndex >= 2 ? 'Hub near you' : 'Artisan Center',
          history: [
            { title: t.statusPlaced, time: createdAt.toLocaleString(), done: true },
            { title: 'Payment Confirmed', time: createdAt.toLocaleString(), done: true },
            { title: t.crafting, time: 'In Progress', done: statusIndex >= 1 },
            { title: t.statusShipped, time: 'Pending', done: statusIndex >= 2 },
          ]
        });
      } else {
        // 2. Fallback to simulation for non-Firestore IDs (Guest orders and demos)
        // Logic: Any ID that is at least 5 chars is valid for demo simulation
        if (orderId.length >= 5) {
          setTrackingData({
            id: orderId.toUpperCase(),
            status: t.statusProcessing,
            statusIndex: 1,
            items: 1,
            eta: 'Arriving in 3 days',
            location: 'Craft Hub, Guwahati',
            history: [
              { title: t.statusPlaced, time: 'Earlier today', done: true },
              { title: 'Payment Confirmed', time: 'Processing', done: true },
              { title: 'Artisan Assigned', time: 'Assigned', done: true },
              { title: t.crafting, time: 'In Progress', done: false },
            ]
          });
        } else {
          setError(t.orderNotFound || 'Order ID not found. Please check and try again.');
        }
      }
    } catch (err) {
      console.error("Tracking error:", err);
      // Fallback if permission denied or other errors, can still simulate for the user
      if (orderId.length >= 5) {
        setTrackingData({
          id: orderId.toUpperCase(),
          status: t.statusProcessing,
          statusIndex: 1,
          items: 1,
          eta: 'Arriving in 3 days',
          location: 'Craft Hub, Guwahati',
          history: [
            { title: t.statusPlaced, time: 'Earlier today', done: true },
            { title: 'Payment Confirmed', time: 'Processing', done: true },
            { title: 'Artisan Assigned', time: 'Assigned', done: true },
            { title: t.crafting, time: 'In Progress', done: false },
          ]
        });
      } else {
        setError("Order ID not found. Use a valid ID like 'ORD-SAMPLE'.");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: t.statusPlaced, icon: CheckCircle2 },
    { label: t.crafting, icon: Clock },
    { label: t.statusShipped, icon: Package },
    { label: t.statusDelivered, icon: MapPin },
  ];

  return (
    <ScreenLayout showNav={false} className="bg-gray-50">
      <div className="flex items-center gap-4 mb-8 pt-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t.trackOrder}</h1>
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-6">
          {t.trackOrderDesc}
        </p>

        {lastOrderId && orderId !== lastOrderId && (
          <button 
            onClick={() => { setOrderId(lastOrderId); handleTrack(); }}
            className="mb-4 text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 flex items-center gap-2 hover:bg-amber-100 transition-colors"
          >
            <Clock size={12} />
            Track Last Order: {lastOrderId}
          </button>
        )}
        
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={20} />
            <input
              type="text"
              placeholder={t.enterOrderId}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono font-bold"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full py-4 text-lg" 
            disabled={loading || !orderId.trim()}
          >
            {loading ? '...' : t.trackNow}
          </Button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center"
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Info size={24} />
            </div>
            <p className="text-red-900 font-bold mb-1">{t.trackingFailed || "Tracking Failed"}</p>
            <p className="text-red-600 text-xs">{error}</p>
          </motion.div>
        )}

        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 pb-20"
          >
            {/* Main Status Card */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">{t.orderIdentifier || "Order Identifier"}</span>
                  <h2 className="text-xl font-black text-gray-900 font-mono tracking-tighter">{trackingData.id}</h2>
                </div>
                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  {trackingData.status}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="relative mb-10 pt-2">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-100 rounded-full" />
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(trackingData.statusIndex / (steps.length - 1)) * 100}%` }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-amber-700 rounded-full z-10" 
                />
                <div className="flex justify-between relative z-20">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                        idx <= trackingData.statusIndex 
                          ? "bg-amber-700 text-white scale-110 shadow-lg shadow-amber-800/20" 
                          : "bg-white text-gray-300 border-2 border-gray-100"
                      )}>
                        <step.icon size={16} />
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-3 transition-colors",
                        idx <= trackingData.statusIndex ? "text-amber-900" : "text-gray-300"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t.arrivalEstimate || "Arrival Estimate"}</span>
                  <p className="text-sm font-bold text-gray-900">{trackingData.eta}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t.currentHub || "Current Hub"}</span>
                  <p className="text-sm font-bold text-gray-900">{trackingData.location}</p>
                </div>
              </div>
            </div>

            {/* Detailed Timeline */}
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">{t.detailedJourney || "Detailed Journey"}</h3>
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 space-y-8 relative overflow-hidden">
                <div className="absolute left-8 top-10 bottom-10 w-px bg-dashed border-l border-gray-100" />
                
                {trackingData.history.map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-6 items-start relative z-10">
                    <div className={cn(
                      "w-4 h-4 rounded-full mt-1.5 flex items-center justify-center transition-all duration-700",
                      event.done ? "bg-amber-700 ring-4 ring-amber-50" : "bg-gray-100 ring-4 ring-transparent"
                    )}>
                      {event.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-bold leading-tight",
                        event.done ? "text-gray-900" : "text-gray-400"
                      )}>{event.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => { setOrderId(''); setTrackingData(null); }}
              className="w-full py-4 rounded-2xl text-gray-400 font-bold border-gray-100"
            >
              {t.checkAnotherOrder || "Check another Order"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenLayout>
  );
}
