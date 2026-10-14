import React, { useEffect, useRef } from 'react';
import { useFleet } from '../context/FleetContext';
import { Chart, registerables } from 'chart.js';
import { 
  Truck, 
  Send, 
  Wrench, 
  Fuel, 
  Gauge, 
  ShieldAlert, 
  ArrowRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  TrendingUp,
  Activity,
  ChevronRight
} from 'lucide-react';

Chart.register(...registerables);

interface DashboardOverviewProps {
  onOpenAddVehicle: () => void;
  onOpenFuelModal: () => void;
  onOpenDispatchModal: () => void;
  onOpenScheduleModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenAddVehicle,
  onOpenFuelModal,
  onOpenDispatchModal,
  onOpenScheduleModal,
}) => {
  const { 
    vehicles, 
    drivers, 
    fuelLogs, 
    maintenanceRecords, 
    deliveryLogs,
    totalVehicles, 
    activeDeliveriesCount, 
    pendingMaintenanceCount, 
    totalMonthlyFuelSpend, 
    fleetAverageEfficiency,
    setActiveTab 
  } = useFleet();

  const miniLineChartRef = useRef<HTMLCanvasElement | null>(null);
  const miniChartInstance = useRef<Chart | null>(null);

  // Active missions
  const activeMissions = drivers.filter(d => d.status === 'On Delivery' && d.activeDelivery);

  // High urgency maintenance items
  const urgentServices = maintenanceRecords.filter(
    m => (m.status === 'Overdue' || (m.status === 'Pending' && m.urgency === 'High'))
  );

  // Render mini chart
  useEffect(() => {
    if (!miniLineChartRef.current) return;

    if (miniChartInstance.current) {
      miniChartInstance.current.destroy();
    }

    miniChartInstance.current = new Chart(miniLineChartRef.current, {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Fuel ($)',
            data: [3920, 4210, 4650, 4480, 4710, totalMonthlyFuelSpend || 4820],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
          {
            label: 'Service ($)',
            data: [840, 1420, 960, 2180, 1150, 1730],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              boxWidth: 8,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: context => {
                const val = context.parsed ? context.parsed.y : 0;
                return ` ${context.dataset.label}: $${Number(val || 0).toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.25)' },
            ticks: {
              color: '#64748b',
              font: { family: 'JetBrains Mono', size: 10 },
              callback: v => `$${v}`,
            },
          },
        },
      },
    });

    return () => {
      if (miniChartInstance.current) {
        miniChartInstance.current.destroy();
      }
    };
  }, [totalMonthlyFuelSpend]);

  return (
    <div className="space-y-6">
      {/* Welcome & Command Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Fleet Command Center
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Terminal 04 Midwest Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Real-Time Vehicle Telemetry & Dispatch Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live operational health for {totalVehicles} registered transport assets. Currently tracking {activeDeliveriesCount} active deliveries in transit.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenDispatchModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Route</span>
          </button>
          <button
            onClick={onOpenFuelModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-colors"
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Log Fuel</span>
          </button>
          <button
            onClick={onOpenScheduleModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule Service</span>
          </button>
          <button
            onClick={onOpenAddVehicle}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Callout (If Any) */}
      {urgentServices.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300">Action Required: </span>
              <span>{urgentServices[0].vehicleModel} ({urgentServices[0].vehiclePlate}) is flagged for {urgentServices[0].serviceType}.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('maintenance')}
            className="font-semibold text-rose-300 hover:text-white flex items-center gap-1 ml-4 shrink-0 transition-colors"
          >
            View Alerts <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet */}
        <button
          onClick={() => setActiveTab('fleet')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Total Fleet Units
            </span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-slate-100 tabular-nums">
            {totalVehicles}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            <span>{vehicles.filter(v => v.status === 'Available').length} In Yard</span>
            <span className="text-cyan-400 flex items-center gap-0.5">Manage <ChevronRight className="w-3 h-3" /></span>
          </div>
        </button>

        {/* In-Transit Deliveries */}
        <button
          onClick={() => setActiveTab('drivers')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
              Active Deliveries
            </span>
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            {activeDeliveriesCount}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            <span>On Highway Corridors</span>
            <span className="text-emerald-400 flex items-center gap-0.5">Live Radar <ChevronRight className="w-3 h-3" /></span>
          </div>
        </button>

        {/* Maintenance Alerts */}
        <button
          onClick={() => setActiveTab('maintenance')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
              Maintenance Due
            </span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
            {pendingMaintenanceCount}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            <span>{urgentServices.length} Critical</span>
            <span className="text-amber-400 flex items-center gap-0.5">Scheduler <ChevronRight className="w-3 h-3" /></span>
          </div>
        </button>

        {/* Monthly Fuel Spend */}
        <button
          onClick={() => setActiveTab('fuel')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Fuel Spend
            </span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tabular-nums">
            ${totalMonthlyFuelSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            <span>{fleetAverageEfficiency} km/L Avg</span>
            <span className="text-cyan-400 flex items-center gap-0.5">Logs <ChevronRight className="w-3 h-3" /></span>
          </div>
        </button>
      </div>

      {/* Main Split: Active Deliveries Tracker (Left) & Expense Trend Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deliveries Radar (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Live Delivery Missions in Progress</h3>
            </div>
            <button
              onClick={() => setActiveTab('drivers')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              All Routes <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {activeMissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active delivery missions running currently.
              </div>
            ) : (
              activeMissions.map(d => {
                const mission = d.activeDelivery!;
                return (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{d.name}</span>
                        <span className="font-mono text-cyan-400 text-[11px] font-bold">[{mission.vehicleId}]</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-[11px]">
                        {mission.progressPercent}% Transit
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1 truncate max-w-[45%]">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        {mission.origin}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0 mx-1" />
                      <span className="flex items-center gap-1 truncate max-w-[45%] justify-end text-slate-300">
                        {mission.destination}
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${mission.progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Operating Cost Snapshot (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Monthly Cost Trajectory</h3>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Analytics
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Fuel vs maintenance cost trajectory across recent 6-month cycles.
            </p>
          </div>

          <div className="h-44 w-full my-auto">
            <canvas ref={miniLineChartRef} />
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fleet Fuel Ratio: <strong className="text-cyan-400 font-mono">74%</strong></span>
            <span>Preventive Ratio: <strong className="text-amber-400 font-mono">26%</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Fleet Activity Stream */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Recent Operational Activity</h3>
          <span className="text-xs text-slate-500 font-mono">Live Audit Trail</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Latest completed delivery */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-slate-200">Delivery Fulfillments</span>
            </div>
            <p className="text-slate-400 mt-1">
              {deliveryLogs[0] ? (
                <><strong>{deliveryLogs[0].driverName}</strong> completed <strong>{deliveryLogs[0].destination}</strong> ({deliveryLogs[0].distanceKm} km).</>
              ) : 'No recent completed deliveries.'}
            </p>
            <span className="text-[10px] text-slate-500 mt-2 block font-mono">
              {deliveryLogs[0]?.completedAt || 'Recently'}
            </span>
          </div>

          {/* Latest fuel refill */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Fuel className="w-4 h-4" />
              <span className="font-semibold text-slate-200">Fuel Transaction</span>
            </div>
            <p className="text-slate-400 mt-1">
              {fuelLogs[0] ? (
                <><strong>{fuelLogs[0].vehicleId}</strong> refilled <strong>{fuelLogs[0].liters}L</strong> at ${fuelLogs[0].totalCost.toFixed(2)} ({fuelLogs[0].efficiencyKmPerLiter} km/L).</>
              ) : 'No fuel logs yet.'}
            </p>
            <span className="text-[10px] text-slate-500 mt-2 block font-mono">
              {fuelLogs[0]?.date || 'Recent'}
            </span>
          </div>

          {/* Latest maintenance record */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Wrench className="w-4 h-4" />
              <span className="font-semibold text-slate-200">Maintenance Event</span>
            </div>
            <p className="text-slate-400 mt-1">
              {maintenanceRecords[0] ? (
                <><strong>{maintenanceRecords[0].vehiclePlate}</strong>: {maintenanceRecords[0].serviceType} ({maintenanceRecords[0].status}).</>
              ) : 'No maintenance events.'}
            </p>
            <span className="text-[10px] text-slate-500 mt-2 block font-mono">
              Due: {maintenanceRecords[0]?.dueDate || 'Scheduled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
