import React from 'react';
import { Home, Layers, Settings, Bell, Search, MapPin, CalendarClock, FileText, LogOut, User as UserIcon } from 'lucide-react';
import { Tab } from '../../types';
import { useAuth } from '../auth/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const NavItem = ({ icon, label, active = false, onClick, isCollapsed }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, isCollapsed: boolean }) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group flex items-center justify-center lg:justify-start ${isCollapsed ? 'mb-0 lg:mb-2' : 'mb-2'} ${active ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    {label && <span className={`ml-3 font-medium ${isCollapsed ? 'hidden' : 'hidden lg:block'}`}>{label}</span>}
  </div>
);

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  sidebar, 
  activeTab, 
  onTabChange,
  searchTerm,
  onSearchChange
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [sidebarWidth, setSidebarWidth] = React.useState(416);
  const [isResizing, setIsResizing] = React.useState(false);
  const [settings, setSettings] = React.useState<any>(null);
  const { user, isAdmin, logout } = useAuth();

  // Auto-collapse on small screens on initial load & handle resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Fetch system settings
    fetch('/api/system?action=getSettings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projectName = settings?.project_name || 'HexaSense';
  const projectInitial = projectName.charAt(0).toUpperCase();

  // Handle resizing of right panel
  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col lg:flex-row overflow-hidden print:bg-white print:h-auto print:w-auto print:block">
      {/* Main Navigation (Side or Top when collapsed on mobile) */}
      <nav className={`bg-slate-850 flex ${isSidebarCollapsed ? 'w-full h-16 flex-row lg:w-16 lg:h-full lg:flex-col' : 'w-full h-auto lg:w-64 lg:h-full flex-col'} border-r border-b lg:border-b-0 border-slate-800 z-30 flex-shrink-0 transition-all duration-300 ease-in-out print:hidden`}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? 'w-16 h-16 lg:w-full lg:h-16 justify-center' : 'w-full h-16 justify-between px-6'} border-r lg:border-r-0 lg:border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 flex-shrink-0`}
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {projectInitial}
            </div>
            {!isSidebarCollapsed && <span className="ml-3 text-white font-bold text-lg tracking-tight truncate max-w-[140px]">{projectName}</span>}
          </div>
          {!isSidebarCollapsed && <div className="text-slate-500 hover:text-white lg:hidden">✕</div>}
        </div>

        <div className={`flex-1 p-3 flex ${isSidebarCollapsed ? 'flex-row lg:flex-col justify-around lg:justify-start gap-2' : 'flex-col overflow-y-auto'}`}>
          <NavItem
            icon={<Home size={20} />}
            label="Resumen"
            active={activeTab === Tab.RESUMEN}
            onClick={() => onTabChange(Tab.RESUMEN)}
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem
            icon={<MapPin size={20} />}
            label="Mapa"
            active={activeTab === Tab.MAPA}
            onClick={() => onTabChange(Tab.MAPA)}
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem
            icon={<CalendarClock size={20} />}
            label="Crono"
            active={activeTab === Tab.CRONO}
            onClick={() => onTabChange(Tab.CRONO)}
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Informes"
            active={activeTab === Tab.INFORMES}
            onClick={() => onTabChange(Tab.INFORMES)}
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem
            icon={<Layers size={20} />}
            label="Dispositivos"
            active={activeTab === Tab.DISPOSITIVOS}
            onClick={() => onTabChange(Tab.DISPOSITIVOS)}
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Configuración"
            active={activeTab === Tab.CONFIGURACION}
            onClick={() => onTabChange(Tab.CONFIGURACION)}
            isCollapsed={isSidebarCollapsed}
          />
        </div>

        <div className={`p-4 border-t border-slate-800 transition-all duration-300 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
             <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-sky-400">
               <UserIcon size={16} />
             </div>
             {!isSidebarCollapsed && (
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-white truncate">{user?.username || 'Usuario'}</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user?.role || 'Visitante'}</p>
               </div>
             )}
             <button 
               onClick={logout}
               className={`p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ${isSidebarCollapsed ? '' : 'ml-auto'}`}
               title="Cerrar sesión"
             >
               <LogOut size={18} />
             </button>
          </div>
        </div>

        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-slate-800 text-center lg:text-left transition-opacity duration-300 hidden lg:block">
            <div className="text-xs text-slate-500 mb-1">Conectado a</div>
            <div className="text-xs font-mono text-sky-500 truncate">cloud.thethings.network</div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden print:overflow-visible print:h-auto print:block">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 absolute top-0 left-0 right-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <h1 className="text-sm lg:text-xl font-semibold text-white truncate">{projectName}</h1>
            {isAdmin && (
               <span className="hidden sm:inline-block px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[10px] text-sky-400 font-bold uppercase tracking-widest">Admin</span>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar sensor..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-slate-800 text-sm text-white pl-9 pr-4 py-1.5 rounded-full border border-slate-700 focus:outline-none focus:border-sky-500 transition-colors w-40 lg:w-64"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden pt-16 flex flex-col lg:flex-row print:pt-0 print:block print:h-auto">
          {/* Center Canvas */}
          <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col relative min-h-[400px] lg:min-h-0 print:p-0 print:block print:h-auto print:min-h-0">
            {children}
            {isResizing && <div className="absolute inset-0 z-50 cursor-col-resize mix-blend-overlay" />}
          </div>

          {/* Resizer Handle */}
          {sidebar && isDesktop && (
            <div 
              onMouseDown={() => setIsResizing(true)}
              className={`w-1 lg:w-1.5 cursor-col-resize flex-shrink-0 z-30 group flex flex-col items-center justify-center border-l border-slate-700 hover:bg-sky-500/50 transition-colors ${isResizing ? 'bg-sky-500' : 'bg-slate-800'}`}
              title="Arrastra para redimensionar el panel"
            >
              <div className="h-8 w-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full h-1 bg-sky-300 rounded"></div>
                <div className="w-full h-1 bg-sky-300 rounded"></div>
                <div className="w-full h-1 bg-sky-300 rounded"></div>
              </div>
            </div>
          )}

          {/* Right Panel - Context Aware */}
          {sidebar && (
            <div 
              style={isDesktop ? { width: `${sidebarWidth}px`, flexBasis: `${sidebarWidth}px` } : undefined}
              className={`w-full bg-slate-800 border-t lg:border-t-0 flex-shrink-0 z-20 shadow-xl relative min-h-[500px] lg:min-h-0 print:hidden ${!isDesktop ? 'border-l-0' : 'border-l-0' /* Handled by resizer */}`}
            >
              {sidebar}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;