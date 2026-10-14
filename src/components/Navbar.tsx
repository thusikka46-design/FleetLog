import React, { useState, useRef, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { 
  Truck, 
  Send, 
  Wrench, 
  Fuel, 
  Bell, 
  CheckCheck, 
  RotateCcw, 
  User, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { 
    totalVehicles, 
    activeDeliveriesCount, 
    pendingMaintenanceCount, 
    totalMonthlyFuelSpend,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    dismissNotification,
    resetToDemoData,
    setActiveTab
  } = useFleet();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-3">
        {/* Left: Mobile hamburger + App Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-950/40 text-white font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-display">
                FleetLog<span className="text-cyan-400">Pro</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quick Status Indicators (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
          {/* Total Vehicles */}
          <button 
            onClick={() => setActiveTab('fleet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors text-left"
            title="View fleet vehicle list"
          >
            <div className="w-6 h-6 rounded-md bg-slate-700/80 flex items-center justify-center text-slate-300">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Vehicles</span>
              <span className="text-sm font-semibold text-slate-100 font-mono tabular-nums">{totalVehicles} Total</span>
            </div>
          </button>

          {/* Active Deliveries */}
          <button 
            onClick={() => setActiveTab('drivers')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 transition-colors text-left"
            title="View live active deliveries"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-900/60 flex items-center justify-center text-emerald-400">
              <Send className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold block">In Transit</span>
              <span className="text-sm font-semibold text-emerald-300 font-mono tabular-nums">{activeDeliveriesCount} Active</span>
            </div>
          </button>

          {/* Pending Maintenance Alerts */}
          <button 
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-left border ${
              pendingMaintenanceCount > 0 
                ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-800/50 text-amber-300' 
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
            }`}
            title="View maintenance alerts"
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              pendingMaintenanceCount > 0 ? 'bg-amber-900/60 text-amber-400' : 'bg-slate-700/80 text-slate-300'
            }`}>
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold block">Alerts</span>
              <span className="text-sm font-semibold font-mono tabular-nums">{pendingMaintenanceCount} Due</span>
            </div>
          </button>

          {/* Total Monthly Fuel Spend */}
          <button 
            onClick={() => setActiveTab('fuel')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors text-left"
            title="View fuel logs and spend"
          >
            <div className="w-6 h-6 rounded-md bg-cyan-950/80 text-cyan-400 flex items-center justify-center">
              <Fuel className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Fuel Spend</span>
              <span className="text-sm font-semibold text-cyan-300 font-mono tabular-nums">
                ${totalMonthlyFuelSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </button>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-2">
          {/* Notification dropdown toggle */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">Fleet Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-xs text-cyan-400 font-mono font-medium">({unreadNotificationsCount} new)</span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 text-left transition-colors flex gap-3 ${
                          n.read ? 'bg-slate-900/60 hover:bg-slate-800/40' : 'bg-slate-800/40 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'alert' && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                          {n.type === 'warning' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          {n.type === 'success' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          {n.type === 'info' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                            <span>{n.timestamp}</span>
                            {n.actionTab && (
                              <button
                                onClick={() => {
                                  setActiveTab(n.actionTab!);
                                  setShowNotifications(false);
                                }}
                                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 font-medium"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="text-slate-600 hover:text-slate-400 text-xs self-start"
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="User profile and settings"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/60 flex items-center justify-center text-cyan-400 font-semibold text-xs">
                OP
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-semibold text-slate-200 block truncate max-w-[100px]">Ops Center</span>
                <span className="text-[11px] text-slate-400 block">Dispatch Lead</span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="font-semibold text-slate-200">Fleet Operations Lead</div>
                  <div className="text-[11px] text-slate-400 truncate">dispatch@fleetlogpro.internal</div>
                  <div className="mt-1 text-[11px] text-cyan-400 font-mono">Terminal #04 Midwest Hub</div>
                </div>

                <button
                  onClick={() => {
                    resetToDemoData();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Demo Fleet Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Quick Status Strip (Visible on small screens) */}
      <div className="md:hidden grid grid-cols-4 gap-1 px-3 py-2 border-t border-slate-800/80 bg-slate-900/60 text-[11px]">
        <button onClick={() => setActiveTab('fleet')} className="text-center py-1 rounded bg-slate-800/40">
          <span className="text-slate-400 block text-[9px]">FLEET</span>
          <span className="font-semibold font-mono text-slate-200">{totalVehicles}</span>
        </button>
        <button onClick={() => setActiveTab('drivers')} className="text-center py-1 rounded bg-emerald-950/30 text-emerald-300">
          <span className="text-emerald-400 block text-[9px]">ACTIVE</span>
          <span className="font-semibold font-mono">{activeDeliveriesCount}</span>
        </button>
        <button onClick={() => setActiveTab('maintenance')} className="text-center py-1 rounded bg-amber-950/30 text-amber-300">
          <span className="text-amber-400 block text-[9px]">ALERTS</span>
          <span className="font-semibold font-mono">{pendingMaintenanceCount}</span>
        </button>
        <button onClick={() => setActiveTab('fuel')} className="text-center py-1 rounded bg-slate-800/40 text-cyan-300">
          <span className="text-slate-400 block text-[9px]">FUEL</span>
          <span className="font-semibold font-mono">${(totalMonthlyFuelSpend / 1000).toFixed(1)}k</span>
        </button>
      </div>
    </header>
  );
};
