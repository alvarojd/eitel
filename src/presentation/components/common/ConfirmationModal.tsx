'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 title: string;
 description: string;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: 'danger' | 'warning' | 'info';
 isLoading?: boolean;
}

export function ConfirmationModal({
 isOpen,
 onClose,
 onConfirm,
 title,
 description,
 confirmLabel = 'Confirmar',
 cancelLabel = 'Cancelar',
 variant = 'danger',
 isLoading = false
}: ConfirmationModalProps) {
 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
 />
 
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
 >
 <div className="p-8">
 <div className="flex items-center gap-4 mb-6">
 <div className={cn(
"w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
 variant === 'danger' ?"bg-rose-500/10 text-rose-500 border border-rose-500/20" :
 variant === 'warning' ?"bg-amber-500/10 text-amber-500 border border-amber-500/20" :
"bg-sky-500/10 text-sky-500 border border-sky-500/20"
 )}>
 <AlertTriangle size={24} />
 </div>
 <div>
 <h3 className="text-xl font-black text-white">{title}</h3>
 <p className="text-[10px] text-slate-500 tracking-widest font-bold mt-0.5">Acción administrativa requerida</p>
 </div>
 </div>

 <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8">
 {description}
 </p>

 <div className="flex flex-col gap-3">
 <button
 onClick={onConfirm}
 disabled={isLoading}
 className={cn(
"w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3",
 variant === 'danger' ?"bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20" :
 variant === 'warning' ?"bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20" :
"bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20"
 )}
 >
 {isLoading ? <Loader2 size={18} className="animate-spin" /> : confirmLabel}
 </button>
 <button
 onClick={onClose}
 disabled={isLoading}
 className="w-full py-4 text-slate-500 hover:text-white font-black text-sm tracking-widest transition-colors"
 >
 {cancelLabel}
 </button>
 </div>
 </div>

 <button 
 onClick={onClose}
 className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
 >
 <X size={20} />
 </button>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
}
