import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

export default function Toast() {
  const { notification } = useApp();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-6 right-6 z-[100] flex justify-center pointer-events-none"
        >
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl pointer-events-auto border",
            notification.type === 'success' 
              ? "bg-amber-900 border-amber-800 text-white" 
              : "bg-red-600 border-red-500 text-white"
          )}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="text-amber-400" size={20} />
            ) : (
              <AlertCircle className="text-red-200" size={20} />
            )}
            <span className="text-sm font-bold tracking-tight">{notification.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
