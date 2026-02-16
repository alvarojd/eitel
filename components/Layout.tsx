import React from 'react';
import { Home, Layers, Settings, Bell, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200 group flex items-center justify-center lg:justify-start ${active ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    {label && <span className="ml-3 hidden lg:block font-medium">{label}</span>}
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, sidebar, activeTab, onTabChange }) => {
  return (
    <div className="h-screen w-screen bg-slate-900 flex overflow-hidden">
      {/* Main Navigation (Left Slim) */}
      <nav className="w-16 lg:w-64 bg-slate-850 h-full flex flex-col border-r border-slate-800 z-10 flex-shrink-0">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
          <span className="ml-3 text-white font-bold text-lg hidden lg:block tracking-tight">HexaSense</span>
        </div>

        <div className="flex-1 p-3">
          <NavItem
            icon={<Home size={20} />}
            label="Resumen"
            active={activeTab === 'resumen'}
            onClick={() => onTabChange('resumen')}
          />
          <NavItem
            icon={<Layers size={20} />}
            label="Dispositivos"
            active={activeTab === 'dispositivos'}
            onClick={() => onTabChange('dispositivos')}
          />
          <NavItem
            icon={<Bell size={20} />}
            label="Alertas"
            active={activeTab === 'alertas'}
            onClick={() => onTabChange('alertas')}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Configuración"
            active={activeTab === 'configuracion'}
            onClick={() => onTabChange('configuracion')}
          />
        </div>

        <div className="p-4 border-t border-slate-800 text-center lg:text-left">
          <div className="text-xs text-slate-500 hidden lg:block mb-1">Conectado a</div>
          <div className="text-xs font-mono text-sky-500 hidden lg:block truncate">cloud.thethings.network</div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 absolute top-0 left-0 right-0 z-10">
          <h1 className="text-xl font-semibold text-white">Proyecto: Monitor Ciudad Inteligente</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar sensor..."
                className="bg-slate-800 text-sm text-white pl-9 pr-4 py-1.5 rounded-full border border-slate-700 focus:outline-none focus:border-sky-500 transition-colors w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden pt-16 flex">
          {/* Center Canvas */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col relative">
            {children}
          </div>

          {/* Right Panel - Context Aware */}
          <div className="w-80 bg-slate-800 border-l border-slate-800 flex-shrink-0 z-20 shadow-xl relative">
            {sidebar}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;