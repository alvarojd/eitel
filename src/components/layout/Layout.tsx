import React from 'react';
import { Home, Layers, Settings, Bell, Search, MapPin, CalendarClock } from 'lucide-react';
import { Tab } from '../../types';

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

  // Auto-collapse on small screens on initial load
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    // We don't necessarily want to force it on every resize if the user manually toggled it,
    // but for initial load it's good.
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* Main Navigation (Side or Top when collapsed on mobile) */}
      <nav className={`bg-slate-850 flex ${isSidebarCollapsed ? 'w-full h-16 flex-row lg:w-16 lg:h-full lg:flex-col' : 'w-full h-auto lg:w-64 lg:h-full flex-col'} border-r border-b lg:border-b-0 border-slate-800 z-30 flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? 'w-16 h-16 lg:w-full lg:h-16 justify-center' : 'w-full h-16 justify-between px-6'} border-r lg:border-r-0 lg:border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 flex-shrink-0`}
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">H</div>
            {!isSidebarCollapsed && <span className="ml-3 text-white font-bold text-lg tracking-tight">HexaSense</span>}
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
            icon={<Layers size={20} />}
            label="Dispositivos"
            active={activeTab === Tab.DISPOSITIVOS}
            onClick={() => onTabChange(Tab.DISPOSITIVOS)}
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem
            icon={<Bell size={20} />}
            label="Alertas"
            active={activeTab === Tab.ALERTAS}
            onClick={() => onTabChange(Tab.ALERTAS)}
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

        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-slate-800 text-center lg:text-left transition-opacity duration-300 hidden lg:block">
            <div className="text-xs text-slate-500 mb-1">Conectado a</div>
            <div className="text-xs font-mono text-sky-500 truncate">cloud.thethings.network</div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 absolute top-0 left-0 right-0 z-10">
          <h1 className="text-sm lg:text-xl font-semibold text-white truncate mr-2">Energía Inteligente para Todos</h1>
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
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700 flex-shrink-0">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden pt-16 flex flex-col lg:flex-row">
          {/* Center Canvas */}
          <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col relative min-h-[400px] lg:min-h-0">
            {children}
          </div>

          {/* Right Panel - Context Aware */}
          <div className="w-full lg:w-80 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 flex-shrink-0 z-20 shadow-xl relative min-h-[500px] lg:min-h-0">
            {sidebar}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;