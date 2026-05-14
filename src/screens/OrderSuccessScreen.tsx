import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Download, ArrowRight } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import Button from '../components/Button';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderSuccessScreen() {
  const { language, clearCart, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  const { orderId, total, cart } = location.state || { 
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(), 
    total: 0,
    cart: [] 
  };

  const [activeStep, setActiveStep] = React.useState(1);

  const today = new Date();
  const formatTime = (date: Date, minutesOffset: number) => {
    const d = new Date(date.getTime() + minutesOffset * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    // Clear cart when landing on success page
    clearCart();
    
    // Simulate real-time tracking progression for demo
    const timer = setTimeout(() => setActiveStep(2), 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const downloadInvoice = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");

      const formatPrice = (value: number) => {
        return `\u20B9${Number(value).toLocaleString("en-IN")}`;
      };
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(110, 80, 20); // Bamboo Rich
      doc.text('HASTA-SHILPA', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Artisan Bamboo Furniture & Crafts', 105, 27, { align: 'center' });
      doc.line(20, 32, 190, 32);
      
      // Invoice Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`INVOICE: ${orderId}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);
      
      if (user) {
        doc.text(`Customer: ${user.name}`, 140, 45);
        doc.text(`Contact: ${user.phone || 'N/A'}`, 140, 52);
      }
      
      // Table
      const tableData = cart.map((item: any) => [
        item.title?.en || item.title || 'Product',
        formatPrice(item.price),
        item.quantity,
        formatPrice(item.price * item.quantity)
      ]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Product', 'Rate', 'Qty', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [110, 80, 20] }, // Bamboo Rich
        columnStyles: {
          3: { halign: 'right' }
        }
      });
      
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 200;
      
      // Totals
      doc.setFontSize(14);
      doc.text(`Total Amount: ${formatPrice(total)}`, 190, finalY, { align: 'right' });
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Thank you for supporting sustainable craftsmanship!', 105, 280, { align: 'center' });
      
      const fileName = `Invoice_${orderId}.pdf`;
      const blob = doc.output('blob');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const link = document.createElement('a');
        link.href = base64data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !base64data.includes('data:application/pdf')) {
           window.open(base64data, '_blank');
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Could not generate invoice. Please try again.");
    }
  };

  const steps = [
    { label: t.statusPlaced, date: `Today, ${formatTime(today, 0)}`, done: activeStep >= 1 },
    { label: t.statusProcessing, date: `Today, ${formatTime(today, 5)}`, done: activeStep >= 2 },
    { label: t.statusShipped, date: 'Expected Tomorrow', done: activeStep >= 3 },
    { label: t.statusDelivered, date: 'Expected within 3-4 days', done: activeStep >= 4 },
  ];

  return (
    <ScreenLayout showNav={false} className="bg-white">
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-[40px] flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">{t.orderSuccess}</h1>
          <p className="text-gray-500 mb-8 max-w-[250px] mx-auto">Your traditional craftsmanship journey begins today. We've received your order.</p>
          
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-8 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.orderId}</span>
              <span className="font-mono font-bold text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between items-center px-2 border-t border-gray-100 pt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.total}</span>
              <span className="font-bold text-amber-700">₹{total}</span>
            </div>
            <p className="text-[10px] text-gray-400 italic">Bill generated on {new Date().toLocaleString()}</p>
          </div>

          <div className="w-full max-w-[320px] mx-auto mb-10 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag size={18} className="text-amber-700" />
              {t.orderTracking}
            </h3>
            
            <div className="space-y-6 relative">
              {/* Timeline Connector */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />

              {steps.map((step, idx) => (
                <motion.div 
                  key={idx} 
                  initial={false}
                  animate={{ opacity: step.done ? 1 : 0.4 }}
                  className="flex gap-4 items-start relative z-10"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500",
                    step.done ? "bg-green-500 scale-110" : "bg-gray-200"
                  )}>
                    {step.done && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold transition-colors duration-500",
                      step.done ? "text-gray-900" : "text-gray-400"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{step.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-3 w-full max-w-[300px]">
            <Button 
                onClick={() => navigate('/home')}
                className="w-full py-4 text-lg"
                rightIcon={<ArrowRight size={20} />}
            >
              {t.continueShopping}
            </Button>
            
            <button 
              onClick={downloadInvoice}
              className="w-full py-4 text-sm font-bold text-gray-500 flex items-center justify-center gap-2 hover:text-amber-700 transition-colors"
            >
              <Download size={18} />
              Download Invoice
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-6 py-8 grayscale opacity-30 mt-auto"
      >
        <ShoppingBag size={24} />
        <span className="text-xl font-black italic tracking-tighter">Hasta-Shilpa</span>
      </motion.div>
    </ScreenLayout>
  );
}
