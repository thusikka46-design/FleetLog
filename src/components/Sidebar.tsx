import React from 'react';
import { useFleet } from '../context/FleetContext';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Fuel, 
  Wrench, 
  BarChart3, 
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    vehicles, 
    activeDeliveriesCount, 
    pendingMaintenanceCount 
  } = useFleet();

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'fleet',
      label: 'Fleet & Vehicle Management',
      icon: Truck,
      badge: `${vehicles.length}`,
    },
    {
      id: 'drivers',
      label: 'Driver Assignment & Logs',
      icon: Users,
      badge: activeDeliveriesCount > 0 ? `${activeDeliveriesCount} Active` : null,
      badgeVariant: 'emerald',
    },
    {
      id: 'fuel',
      label: 'Fuel Efficiency Tracker',
      icon: Fuel,
      badge: null,
    },
    {
      id: 'maintenance',
      label: 'Maintenance Scheduler & Alerts',
      icon: Wrench,
      badge: pendingMaintenanceCount > 0 ? `${pendingMaintenanceCount} Due` : null,
      badgeVariant: 'amber',
    },
    {
      id: 'analytics',
      label: 'Expense Reports & Analytics',
      icon: BarChart3,
      badge: 'Live',
      badgeVariant: 'cyan',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  // Fleet operational readiness
  const availableOrActiveCount = vehicles.filter(v => v.status !== 'In Maintenance').length;
  const readinessPercent = vehicles.length > 0 
    ? Math.round((availableOrActiveCount / vehicles.length) * 100) 
    : 100;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation Menu</span>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Operations Workspace
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm border border-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[11px] font-mono shrink-0 ml-2 ${
                    item.badgeVariant === 'amber'
                      ? 'text-amber-400'
                      : item.badgeVariant === 'emerald'
                      ? 'text-emerald-400'
                      : item.badgeVariant === 'cyan'
                      ? 'text-cyan-400'
                      : 'text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Fleet Health Readiness */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Operational Readiness</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{readinessPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>{availableOrActiveCount} Mission-Ready</span>
            <span>{vehicles.length - availableOrActiveCount} In Service</span>
          </div>
        </div>
      </aside>
    </>
  );
};
