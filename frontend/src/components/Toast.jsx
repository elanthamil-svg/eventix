import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-emerald-600', icon: <CheckCircle2 className="w-5 h-5 text-white" /> };
      case 'error':
        return { bg: 'bg-rose-600', icon: <AlertCircle className="w-5 h-5 text-white" /> };
      default:
        return { bg: 'bg-primary-600', icon: <Info className="w-5 h-5 text-white" /> };
    }
  };

  const style = getStyle();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-white font-medium text-sm ${style.bg} flex items-center gap-3 border border-white/20`}
      >
        {style.icon}
        <span>{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
