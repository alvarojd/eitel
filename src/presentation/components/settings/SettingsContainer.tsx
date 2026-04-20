'use client';

import React, { useState } from 'react';
import { 
 Database, 
 Shield, 
 Users as UsersIcon, 
 FileText, 
 Server,
 Settings as SettingsIcon,
 ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Sub-components (we'll implement them in separate files for cleanliness)
import { ProfileTab } from './ProfileTab';
import { UsersTab } from './UsersTab';
import { AuditLogsTab } from './AuditLogsTab';
import { SystemTab } from './SystemTab';

type SettingsTab = 'perfil' | 'usuarios' | 'logs' | 'sistema';

export function SettingsContainer() {
 const { isAdmin, user } = useAuth();
 const [activeTab, setActiveTab] = useState<SettingsTab>('perfil');

 const navItems = [
 { id: 'perfil', label: 'Mi Perfil', icon: Shield, color: 'text-emerald-400' },
 ...(isAdmin ? [
 { id: 'usuarios', label: 'Gestión de Usuarios', icon: UsersIcon, color: 'text-indigo-400' },
 { id: 'logs', label: 'Auditoría del Sistema', icon: FileText, color: 'text-rose-400' }
 ] : []),
 { id: 'sistema', label: 'Información Técnica', icon: Server, color: 'text-sky-400' }
 ];

 return (
 <div className="h-full flex flex-col gap-6 lg:gap-8 animate-in fade-in duration-500">
 {/* Header Area */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl relative group">
 <div className="absolute inset-0 bg-sky-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
 <SettingsIcon size={28} className="text-sky-400 relative z-10" />
 </div>
 <div>
 <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
 Centro de Control
 <span className="text-sky-500">.</span>
 </h1>
 <p className="text-slate-500 text-sm font-medium mt-0.5 tracking-widest">Configuración y Administración</p>
 </div>
 </div>

 {/* Quick User ID Card */}
 <div className="bg-slate-900/50 border border-slate-800/60 pl-4 pr-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-xl">
 <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-white/40">
 {user?.username.substring(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-0.5">Operador Activo</p>
 <p className="text-sm font-black text-white truncate truncate max-w-[120px]">@{user?.username}</p>
 </div>
 </div>
 </div>

 {/* Main Layout: Vertical Navigation + Content */}
 <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
 
 {/* Navigation Sidebar */}
 <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-2">
 {navItems.map((item) => {
 const isActive = activeTab === item.id;
 const Icon = item.icon;
 
 return (
 <button
 key={item.id}
 onClick={() => setActiveTab(item.id as SettingsTab)}
 className={cn(
"group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border",
 isActive 
 ?"bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.1)]" 
 :"bg-slate-900/40 border-slate-800/40 text-slate-400 hover:bg-slate-800/60 hover:text-white hover:border-slate-700"
 )}
 >
 <div className="flex items-center gap-4">
 <div className={cn(
"p-2 rounded-xl transition-all duration-300",
 isActive ?"bg-sky-500/20 shadow-inner" :"bg-slate-950/50 shadow-inner",
 !isActive &&"group-hover:scale-110"
 )}>
 <Icon size={18} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
 </div>
 <span className="text-sm font-bold tracking-tight">{item.label}</span>
 </div>
 {isActive && (
 <motion.div layoutId="active-indicator">
 <ChevronRight size={16} />
 </motion.div>
 )}
 </button>
 );
 })}

 <div className="mt-auto p-6 bg-slate-900/20 rounded-[2rem] border border-slate-800/30 hidden lg:block">
 <p className="text-[10px] font-black text-slate-600 tracking-widest mb-2">Entorno V2.0</p>
 <p className="text-xs text-slate-500 leading-relaxed font-medium">
 Panel administrativo premium. Las acciones realizadas aquí quedan registradas permanentemente.
 </p>
 </div>
 </div>

 {/* Content Area */}
 <div className="flex-1 bg-slate-900/40 rounded-[2.5rem] border border-slate-800/60 shadow-2xl overflow-hidden relative group">
 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
 
 <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 transition={{ duration: 0.3 }}
 className="h-full"
 >
 {activeTab === 'perfil' && <ProfileTab />}
 {activeTab === 'usuarios' && isAdmin && <UsersTab />}
 {activeTab === 'logs' && isAdmin && <AuditLogsTab />}
 {activeTab === 'sistema' && <SystemTab />}
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>
 );
}
