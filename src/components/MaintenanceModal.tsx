import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { MaintenanceRecord, MaintenanceUrgency, Vehicle } from '../types/fleet';
import { X, Wrench, Calendar, CheckCircle2, DollarSign } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicle?: Vehicle | null;
  completingRecord?: MaintenanceRecord | null;
  reschedulingRecord?: MaintenanceRecord | null;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  preselectedVehicle,
  completingRecord,
  reschedulingRecord,
}) => {
  const { vehicles, addMaintenanceRecord, completeMaintenance, rescheduleMaintenance } = useFleet();

  // Schedule mode states
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('Engine Oil & Filter Replacement');
  const [dueDate, setDueDate] = useState('');
  const [dueMileageKm, setDueMileageKm] = useState<number>(0);
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('Medium');
  const [estimatedCost, setEstimatedCost] = useState<number>(450);
  const [technicianNotes, setTechnicianNotes] = useState('');

  // Complete mode states
  const [actualCost, setActualCost] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState('');

  // Reschedule mode states
  const [newDueDate, setNewDueDate] = useState('');
  const [newMileage, setNewMileage] = useState<number>(0);

  useEffect(() => {
    if (completingRecord) {
      setActualCost(completingRecord.estimatedCost);
      setCompletionNotes(completingRecord.technicianNotes || '');
    } else if (reschedulingRecord) {
      setNewDueDate(reschedulingRecord.dueDate);
      setNewMileage(reschedulingRecord.dueMileageKm);
    } else {
      const v = preselectedVehicle || vehicles[0];
      if (v) {
        setVehicleId(v.id);
        const nextTarget = v.nextServiceMileageKm || (v.mileageKm + 15000);
        setDueMileageKm(nextTarget);
        // Default due date: 30 days out
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setDueDate(d.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, preselectedVehicle, completingRecord, reschedulingRecord, vehicles]);

  if (!isOpen) return null;

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find(veh => veh.id === vehicleId);
    if (!v) return;

    addMaintenanceRecord({
      vehicleId: v.id,
      vehiclePlate: v.plateNumber,
      vehicleModel: v.model,
      serviceType,
      dueDate,
      dueMileageKm,
      urgency,
      estimatedCost,
      technicianNotes,
    });
    onClose();
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingRecord) return;
    completeMaintenance(completingRecord.id, actualCost, completionNotes);
    onClose();
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingRecord) return;
    rescheduleMaintenance(reschedulingRecord.id, newDueDate, newMileage);
    onClose();
  };

  // 1. COMPLETING MODE
  if (completingRecord) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">Complete Service Order</h3>
                <p className="text-xs text-slate-400">{completingRecord.vehiclePlate} · {completingRecord.serviceType}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Invoice Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualCost}
                onChange={e => setActualCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Technician Sign-off Notes & Inclusions</label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
                placeholder="Inspected hydraulic lines, replaced OEM seals, passed road test."
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
              Vehicle status will be automatically restored to <span className="text-emerald-400 font-semibold">Available</span>, and next scheduled service mileage incremented by 15,000 km.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-900/30 transition-colors"
              >
                Record as Completed
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. RESCHEDULING MODE
  if (reschedulingRecord) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">Reschedule Service</h3>
                <p className="text-xs text-slate-400">{reschedulingRecord.vehiclePlate} · {reschedulingRecord.serviceType}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Target Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Updated Due Mileage (km)</label>
              <input
                type="number"
                min="0"
                value={newMileage}
                onChange={e => setNewMileage(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-lg shadow-amber-900/30 transition-colors"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. SCHEDULE NEW SERVICE MODE
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Schedule Preventive Maintenance</h3>
              <p className="text-xs text-slate-400">Book inspection, routine fluid renewal or component overhaul</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Fleet Vehicle</label>
            <select
              value={vehicleId}
              onChange={e => {
                setVehicleId(e.target.value);
                const v = vehicles.find(veh => veh.id === e.target.value);
                if (v) setDueMileageKm(v.nextServiceMileageKm || (v.mileageKm + 15000));
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id} · {v.model} ({v.plateNumber}) · {v.mileageKm.toLocaleString()} km
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Engine Oil & Filter Replacement">Engine Oil & Filter Replacement (15,000 km)</option>
              <option value="Brake Pads & Pneumatic Line Inspection">Brake Pads & Pneumatic Line Inspection</option>
              <option value="Transmission Fluid & Differential Flush">Transmission Fluid & Differential Flush</option>
              <option value="Tire Tread Depth Check & 4-Wheel Alignment">Tire Tread Depth Check & 4-Wheel Alignment</option>
              <option value="HV Battery Coolant Flush & Inverter Diagnostic">HV Battery Coolant Flush & Inverter Diagnostic</option>
              <option value="Full DOT Annual Safety Certification">Full DOT Annual Safety Certification</option>
              <option value="Cooling Radiator & Hoses Replacement">Cooling Radiator & Hoses Replacement</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Mileage Threshold (km)</label>
              <input
                type="number"
                min="0"
                value={dueMileageKm}
                onChange={e => setDueMileageKm(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency Level</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as MaintenanceUrgency)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Low">Low - Routine Preventive</option>
                <option value="Medium">Medium - Priority Recommended</option>
                <option value="High">High - Urgent / Safety Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                min="0"
                value={estimatedCost}
                onChange={e => setEstimatedCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Inspection Checklist / Notes</label>
            <textarea
              rows={2}
              value={technicianNotes}
              onChange={e => setTechnicianNotes(e.target.value)}
              placeholder="e.g. Inspect air brake hoses, check caliper wear indicators."
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-900/30 transition-colors"
            >
              Confirm Service Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
