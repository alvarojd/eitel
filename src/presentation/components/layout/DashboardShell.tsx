'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { SensorDrawer } from '../dashboard/SensorDrawer';
import { StatusInfoDrawer } from './StatusInfoDrawer';
import { useAuth } from '@/presentation/context/AuthContext';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BarChart3, 
  Clock, 
  Cpu, 
  Database,
  Loader2 
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DashboardShellProps {
 children: React.ReactNode;
 projectName?: string;
}

export function DashboardShell({ children, projectName }: DashboardShellProps) {
 const { isAuthenticated, isLoading } = useAuth();
 const router = useRouter();

 const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

 useEffect(() => {
 if (!isLoading && !isAuthenticated) {
 router.push('/login');
 }
 }, [isLoading, isAuthenticated, router]);

 if (isLoading) {
 return (
 <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
 <Loader2 className="animate-spin text-sky-500" size={48} />
 <p className="text-slate-400 font-bold tracking-widest text-xs animate-pulse">Cargando Sistema...</p>
 </div>
 );
 }

 if (!isAuthenticated) {
 return null; // El hook useAuth ya maneja la redirección en el useEffect del AuthProvider si fuera necesario, o podemos hacerlo aquí
 }

 return (
 <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden print:block print:h-auto print:bg-white print:text-slate-900">
 <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} projectName={projectName} />
 
 <main className={cn(
"flex-1 min-w-0 transition-all duration-300 flex flex-col h-full print:m-0 print:block",
    "lg:ml-64", 
    isSidebarOpen && "lg:ml-64"
 )}>
 {/* Mobile Header & Nav */}
 <div className="lg:hidden flex flex-col bg-slate-900 border-b border-slate-800 shrink-0 print:hidden sticky top-0 z-40">
 <div className="flex items-center justify-between p-4 pb-2">
 <button 
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className="p-2 -ml-2 text-slate-400 hover:text-white"
 >
 <div className="w-6 h-0.5 bg-current mb-1.5" />
 <div className="w-6 h-0.5 bg-current mb-1.5" />
 <div className="w-6 h-0.5 bg-current" />
 </button>
 <span className="font-bold text-sm text-sky-500">{projectName || 'Hexasense'}</span>
 <div className="w-8" />
 </div>
 
 {/* Mobile Icon Nav */}
 <div className="flex gap-1 px-4 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
 <MobileNavItem href="/" icon={<LayoutDashboard size={20} />} />
 <MobileNavItem href="/map" icon={<MapIcon size={20} />} />
 <MobileNavItem href="/reports" icon={<Clock size={20} />} />
 <MobileNavItem href="/analysis" icon={<BarChart3 size={20} />} />
 <MobileNavItem href="/devices" icon={<Cpu size={20} />} />
 <MobileNavItem href="/history" icon={<Database size={20} />} />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 print:p-0 print:overflow-visible custom-scrollbar">
 {children}
 </div>
 </main>
 
 {/* Side Panels */}
 <SensorDrawer />
 <StatusInfoDrawer />
 </div>
  );
}

function MobileNavItem({ href, icon }: { href: string, icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center justify-center p-2.5 rounded-xl transition-all shrink-0",
        isActive ? "bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]" : "text-white/40 border border-transparent"
      )}
    >
      <span className={cn("transition-transform", isActive && "scale-110")}>{icon}</span>
    </Link>
  );
}
