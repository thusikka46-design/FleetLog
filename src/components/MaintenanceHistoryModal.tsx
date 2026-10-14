import React from 'react';
import { Vehicle } from '../types/fleet';
import { useFleet } from '../context/FleetContext';
import { X, Wrench, Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface MaintenanceHistoryModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduleNew: (vehicle: Vehicle) => void;
}

export const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onScheduleNew,
}) => {
  const { maintenanceRecords } = useFleet();

  if (!isOpen || !vehicle) return null;

  const vehicleRecords = maintenanceRecords.filter(m => m.vehicleId === vehicle.id);

  const totalSpent = vehicleRecords
    .filter(r => r.status === 'Completed' && r.actualCost)
    .reduce((sum, r) => sum + (r.actualCost || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">{vehicle.model}</h3>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{vehicle.plateNumber}</span>
              </div>
              <p className="text-xs text-slate-400">
                Service logs & maintenance records · Current odometer: {vehicle.mileageKm.toLocaleString()} km
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Quick Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/50 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Service Spend</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Last Serviced</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {vehicle.lastServiceDate || 'N/A'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Next Interval Due</span>
            <span className="text-sm font-semibold font-mono text-cyan-400">
              {vehicle.nextServiceMileageKm.toLocaleString()} km
            </span>
          </div>
        </div>

        {/* Service Record List */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-3">
          {vehicleRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No historical maintenance records logged for this vehicle yet.
            </div>
          ) : (
            vehicleRecords.map(record => {
              const isCompleted = record.status === 'Completed';
              const isOverdue = record.status === 'Overdue';

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{record.serviceType}</span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : isOverdue
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {isCompleted ? `Completed: ${record.completedDate}` : `Due: ${record.dueDate}`}
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          Due @ {record.dueMileageKm.toLocaleString()} km
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">
                        {isCompleted ? 'Final Cost' : 'Estimated Cost'}
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-200">
                        ${((isCompleted && record.actualCost) ? record.actualCost : record.estimatedCost).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {record.technicianNotes && (
                    <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mt-2">
                      <span className="text-slate-400 font-medium">Technician Notes: </span>
                      {record.technicianNotes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={() => {
              onClose();
              onScheduleNew(vehicle);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-800/50 rounded-lg transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Schedule New Service For This Unit
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
