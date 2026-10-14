import React, { useState } from 'react';
import { FleetProvider, useFleet } from './context/FleetContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { FleetManagement } from './components/FleetManagement';
import { DriverAssignment } from './components/DriverAssignment';
import { FuelTracker } from './components/FuelTracker';
import { MaintenanceScheduler } from './components/MaintenanceScheduler';
import { ExpenseAnalytics } from './components/ExpenseAnalytics';
import { VehicleModal } from './components/VehicleModal';
import { FuelModal } from './components/FuelModal';
import { AssignmentModal } from './components/AssignmentModal';
import { MaintenanceModal } from './components/MaintenanceModal';

const MainLayout: React.FC = () => {
  const { activeTab, addVehicle } = useFleet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global modal states accessible from command bar
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sticky Top Navigation */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 lg:pl-72 w-full min-w-0 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'overview' && (
              <DashboardOverview
                onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
                onOpenFuelModal={() => setIsFuelModalOpen(true)}
                onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
                onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
              />
            )}
            {activeTab === 'fleet' && <FleetManagement />}
            {activeTab === 'drivers' && <DriverAssignment />}
            {activeTab === 'fuel' && <FuelTracker />}
            {activeTab === 'maintenance' && <MaintenanceScheduler />}
            {activeTab === 'analytics' && <ExpenseAnalytics />}
          </div>

          {/* Quiet clean footer */}
          <footer className="mt-auto px-6 py-4 border-t border-slate-900 bg-slate-950/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-400">FleetLog Pro</span> · Commercial Fleet Operations & Vehicle Maintenance Portal
            </div>
            <div className="text-[11px] text-slate-600">
              Real-time telemetry, fuel efficiency analysis & predictive maintenance scheduling
            </div>
          </footer>
        </main>
      </div>

      {/* Global Modals triggered from quick action command bar */}
      <VehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSubmit={addVehicle}
      />

      <FuelModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
      />

      <AssignmentModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
      />

      <MaintenanceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FleetProvider>
      <MainLayout />
    </FleetProvider>
  );
}
