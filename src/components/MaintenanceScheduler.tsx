import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { MaintenanceRecord, MaintenanceUrgency } from '../types/fleet';
import { 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  AlertOctagon, 
  Check, 
  RotateCcw,
  Truck
} from 'lucide-react';
import { MaintenanceModal } from './MaintenanceModal';

export const MaintenanceScheduler: React.FC = () => {
  const { 
    vehicles, 
    maintenanceRecords, 
    pendingMaintenanceCount 
  } = useFleet();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [completingRecord, setCompletingRecord] = useState<MaintenanceRecord | null>(null);
  const [reschedulingRecord, setReschedulingRecord] = useState<MaintenanceRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Immediate critical alerts (Overdue or High urgency pending)
  const immediateAlerts = maintenanceRecords.filter(
    m => (m.status === 'Overdue' || (m.status === 'Pending' && m.urgency === 'High'))
  );

  // Filtered maintenance list
  const filteredRecords = maintenanceRecords.filter(m => {
    const matchesSearch = 
      m.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || m.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Maintenance Scheduler & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Preventive service schedules, component wear cycles & regulatory DOT inspections
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-900/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </button>
      </div>

      {/* Visual Alert Banner for vehicles due for immediate service */}
      {immediateAlerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-800/80 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-900/80 text-rose-300 border border-rose-700/60 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-rose-200">
                Immediate Action Required: {immediateAlerts.length} Vehicle{immediateAlerts.length > 1 ? 's' : ''} Due for Immediate Service
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Vehicles below have exceeded safety mileage thresholds or are flagged with critical air brake/mechanical faults.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {immediateAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-900/80 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400 text-xs">{alert.vehicleId}</span>
                    <span className="text-xs font-medium text-slate-200">{alert.vehiclePlate}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                      {alert.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 mt-1">{alert.serviceType}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Due at {alert.dueMileageKm.toLocaleString()} km · Due date: {alert.dueDate}
                  </div>
                  {alert.technicianNotes && (
                    <div className="text-[11px] text-rose-300/90 mt-1 italic">
                      "{alert.technicianNotes}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => setCompletingRecord(alert)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Mark Done
                  </button>
                  <button
                    onClick={() => setReschedulingRecord(alert)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Total Pending Services</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {pendingMaintenanceCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled or awaiting shop bay</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">High Urgency Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {maintenanceRecords.filter(m => m.urgency === 'High' && m.status !== 'Completed').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Safety-critical mechanical items</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Completed This Period</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {maintenanceRecords.filter(m => m.status === 'Completed').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Inspected & returned to service</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Maintenance Spend</span>
            <Wrench className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-200 tabular-nums">
            ${maintenanceRecords
              .filter(m => m.status === 'Completed' && m.actualCost)
              .reduce((sum, m) => sum + (m.actualCost || 0), 0)
              .toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Settled workshop work orders</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by vehicle ID, plate, or service type..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status select */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="Overdue" className="bg-slate-900">Overdue</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
              </select>
            </div>

            {/* Urgency select */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium">Urgency:</span>
              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Levels</option>
                <option value="High" className="bg-slate-900">High</option>
                <option value="Medium" className="bg-slate-900">Medium</option>
                <option value="Low" className="bg-slate-900">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Schedule Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3 px-4">Vehicle Unit</th>
                <th className="py-3 px-4">Service Type & Checklist</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Target Mileage</th>
                <th className="py-3 px-4">Urgency Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Estimated / Actual</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No maintenance records matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(m => {
                  const isCompleted = m.status === 'Completed';
                  const isOverdue = m.status === 'Overdue';

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-cyan-400">{m.vehicleId}</span>
                        <div className="text-[11px] text-slate-400 font-mono">{m.vehiclePlate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{m.serviceType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                          {m.technicianNotes || m.vehicleModel}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {isCompleted ? m.completedDate : m.dueDate}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                        {m.dueMileageKm.toLocaleString()} km
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          m.urgency === 'High'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                            : m.urgency === 'Medium'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                            : 'bg-blue-950/60 text-blue-400 border-blue-800/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            m.urgency === 'High' ? 'bg-rose-400' :
                            m.urgency === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          {m.urgency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          isCompleted
                            ? 'text-emerald-400 bg-emerald-950/40'
                            : isOverdue
                            ? 'text-rose-400 bg-rose-950/40'
                            : 'text-amber-400 bg-amber-950/40'
                        }`}>
                          {m.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap font-medium">
                        ${((isCompleted && m.actualCost) ? m.actualCost : m.estimatedCost).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {!isCompleted ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setCompletingRecord(m)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Mark Service Completed"
                            >
                              <Check className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => setReschedulingRecord(m)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Reschedule Service"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Modals */}
      <MaintenanceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <MaintenanceModal
        isOpen={!!completingRecord}
        onClose={() => setCompletingRecord(null)}
        completingRecord={completingRecord}
      />

      <MaintenanceModal
        isOpen={!!reschedulingRecord}
        onClose={() => setReschedulingRecord(null)}
        reschedulingRecord={reschedulingRecord}
      />
    </div>
  );
};
