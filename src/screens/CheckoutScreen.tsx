import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Landmark, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import Button from '../components/Button';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CheckoutScreen() {
  const { cart, language, showNotification, setLastOrderId } = useApp();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const paymentMethods = [
    { id: 'upi', label: t.upi, icon: Wallet, description: 'Pay using any UPI app' },
    { id: 'card', label: t.card, icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'net', label: t.netBanking, icon: Landmark, description: 'All major Indian banks' },
    { id: 'cod', label: t.cod, icon: Truck, description: 'Pay when you receive' },
  ];

  const steps = [
    "Securely initializing...",
    `Authenticating ${paymentMethod.toUpperCase()}...`,
    "Authorizing with Bank...",
    "Order Finalized!"
  ];

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setProcessStep(0);
    
    // Simulate multi-stage payment processing
    const stepInterval = setInterval(() => {
      setProcessStep(prev => prev + 1);
    }, 1000);

    try {
      // 1. Authenticate with bank simulation (delay)
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(stepInterval);
      setProcessStep(3);

      // 2. Save order to Firestore
      if (auth.currentUser) {
        const orderData = {
          userId: auth.currentUser.uid,
          items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          })),
          total,
          subtotal,
          shipping,
          tax,
          paymentMethod,
          status: 'paid',
          createdAt: serverTimestamp()
        };

        const ordersPath = 'orders';
        try {
          const docRef = await addDoc(collection(db, ordersPath), orderData);
          showNotification('Payment successful and order placed!');
          setLastOrderId(docRef.id);
          
          setTimeout(() => {
            navigate('/order-success', { state: { orderId: docRef.id, total, cart } });
          }, 800);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, ordersPath);
        }
      } else {
        // Guest user order ID simulation
        const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        setLastOrderId(orderId);
        showNotification('Order placed successfully (Guest)');
        setTimeout(() => {
          navigate('/order-success', { state: { orderId, total, cart } });
        }, 800);
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      showNotification('Payment failed. Please try again.');
    }
  };

  return (
    <ScreenLayout showNav={false} className="bg-gray-50">
      <div className="flex items-center gap-4 mb-6 pt-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t.payment}</h1>
      </div>

      <div className={cn("space-y-6 pb-32 transition-opacity duration-300", isProcessing && "opacity-20 pointer-events-none")}>
        {/* Order Summary */}
        <section>
          <div className="flex justify-between items-end mb-3">
             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.orderSummary}</h2>
             <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{cart.length} {t.items}</span>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="max-h-32 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-bold text-gray-900 truncate">{item.title[language] || item.title.en}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-dashed border-gray-100 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t.subtotal}</span>
                <span className="font-medium text-gray-700">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t.shipping}</span>
                <span className={cn("font-medium", shipping === 0 ? "text-green-600" : "text-gray-700")}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t.tax}</span>
                <span className="font-medium text-gray-700">₹{tax}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-900 pt-3 mt-1 border-t border-gray-100">
                <span>{t.total}</span>
                <span className="text-amber-700">₹{total}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.paymentMethod}</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                  paymentMethod === method.id 
                    ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20" 
                    : "bg-white border-gray-100 hover:border-amber-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    paymentMethod === method.id ? "bg-amber-700 text-white" : "bg-gray-50 text-gray-500"
                  )}>
                    <method.icon size={24} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-bold text-sm",
                      paymentMethod === method.id ? "text-amber-900" : "text-gray-900"
                    )}>
                      {method.label}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{method.description}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  paymentMethod === method.id ? "border-amber-700 bg-amber-700 scale-110" : "border-gray-200"
                )}>
                  {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl">
          <div className="relative mb-12">
             <div className="w-24 h-24 border-4 border-amber-100 rounded-full" />
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="w-24 h-24 border-4 border-amber-700 border-t-transparent rounded-full absolute top-0 left-0" 
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck size={32} className="text-amber-700" />
             </div>
          </div>
          
          <div className="text-center px-10">
            <motion.h3 
              key={processStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-gray-900 mb-2"
            >
              {steps[processStep]}
            </motion.h3>
            <p className="text-gray-400 font-medium text-sm">Transaction Securely encrypted (256-bit)</p>
          </div>

          <div className="mt-12 flex gap-2">
            {[0, 1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-500",
                  processStep >= s ? "bg-amber-700 w-8" : "bg-gray-200"
                )} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center justify-between gap-4 z-40">
        <div className="shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Total Pay</p>
          <p className="text-xl font-black text-gray-900 font-mono">₹{total}</p>
        </div>
        <Button 
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className={cn("flex-1 py-4 text-lg shadow-xl shadow-amber-900/10", isProcessing && "opacity-0")}
          rightIcon={<ChevronRight size={20} />}
        >
          {t.placeOrder}
        </Button>
      </div>
    </ScreenLayout>

  );
}
