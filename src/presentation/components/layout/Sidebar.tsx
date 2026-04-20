'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
 LayoutDashboard, 
 Map as MapIcon, 
 BarChart3, 
 Settings, 
 Hexagon,
 LogOut,
 Cpu,
 Clock,
 Database,
 LineChart,
 Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Necesitaremos crear este helper
import { useAuth } from '@/presentation/context/AuthContext';

const navItems = [
  { name: 'Resumen', href: '/', icon: LayoutDashboard },
  { name: 'Mapa', href: '/map', icon: MapIcon },
  { name: 'Crono', href: '/reports', icon: Clock },
  { name: 'Dispositivos', href: '/devices', icon: Cpu },
  { name: 'Reporte', href: '/analysis', icon: BarChart3 },
  { name: 'Analítica', href: '/analytics', icon: LineChart },
  { name: 'Históricos', href: '/history', icon: Database },
  { name: 'Ajustes', href: '/settings', icon: Settings },
];

interface SidebarProps {
 isOpen: boolean;
 setIsOpen: (open: boolean) => void;
 projectName?: string;
}

export function Sidebar({ isOpen, setIsOpen, projectName }: SidebarProps) {
 const pathname = usePathname();
 const { logout } = useAuth();

 return (
 <aside className={cn(
"fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col z-[60] transition-all duration-300 print:hidden",
"w-16 lg:w-64",
 isOpen ?"translate-x-0 w-64 shadow-2xl" :"translate-x-0",
"max-lg:-translate-x-full", 
 isOpen &&"max-lg:translate-x-0"
 )}>
 <div className="flex items-center justify-between px-4 lg:px-6 py-8">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-sky-500 rounded-lg flex items-center justify-center -rotate-12 bg-sky-500/10 shrink-0">
 <Hexagon className="text-sky-500 w-5 h-5 lg:w-6 lg:h-6 fill-sky-500/20" />
 </div>
 <span className={cn(
"hidden lg:block font-bold text-lg text-slate-50 tracking-tight leading-tight",
 isOpen &&"block"
 )}>
 <div className="flex flex-col">
 <span className="truncate max-w-[160px]">Hexasense</span>
 <span className="text-[10px] text-sky-500 font-medium tracking-[0.2em]">IoT System</span>
 </div>
 </span>
 </div>
 
 {/* Mobile Close Button */}
 {isOpen && (
 <button 
 onClick={() => setIsOpen(false)}
 className="lg:hidden p-2 text-slate-500 hover:text-white"
 >
 <div className="w-5 h-5 relative flex items-center justify-center">
 <div className="absolute w-full h-0.5 bg-current rotate-45" />
 <div className="absolute w-full h-0.5 bg-current -rotate-45" />
 </div>
 </button>
 )}
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-3 space-y-2">
 {navItems.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.name}
 href={item.href}
 className={cn(
"flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
 isActive 
 ?"bg-sky-500/10 text-sky-400 font-bold shadow-[inset_0_0_20px_rgba(14,165,233,0.05)] border border-sky-500/20" 
 :"text-white/80 hover:bg-slate-800/50 hover:text-slate-200"
 )}
 >
 <item.icon size={22} className={cn(
"transition-transform group-hover:scale-110",
 isActive &&"text-sky-400"
 )} />
 <span className={cn("hidden lg:block text-sm", isOpen &&"block")}>{item.name}</span>
 
 {/* Active Indicator Bar */}
 {isActive && (
 <div className="absolute left-0 w-1 h-6 bg-sky-500 rounded-r-full" />
 )}
 </Link>
 );
 })}
 </nav>

 {/* Footer / User Area */}
 <div className="p-4 border-t border-slate-800">
 <button 
 onClick={logout}
 className="flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
 >
 <LogOut size={20} />
 <span className={cn("hidden lg:block text-sm font-medium", isOpen &&"block")}>Cerrar Sesión</span>
 </button>
 </div>
 </aside>
 );
}
