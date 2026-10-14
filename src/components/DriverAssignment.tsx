import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Driver, DriverStatus } from '../types/fleet';
import { 
  Users, 
  Send, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Truck, 
  Calendar, 
  History, 
  ArrowRight, 
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { AssignmentModal } from './AssignmentModal';

export const DriverAssignment: React.FC = () => {
  const { 
    drivers, 
    vehicles, 
    deliveryLogs, 
    completeDelivery, 
    updateDeliveryProgress 
  } = useFleet();

  const [activeTab, setActiveTab] = useState<'roster' | 'active_missions' | 'history'>('active_missions');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(undefined);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completingDeliveryId, setCompletingDeliveryId] = useState<string | null>(null);

  const activeDrivers = drivers.filter(d => d.status === 'On Delivery' && d.activeDelivery);
  const restingDrivers = drivers.filter(d => d.status === 'Resting');
  const unassignedDrivers = drivers.filter(d => d.status === 'Unassigned');

  const handleCompleteMission = (deliveryId: string) => {
    completeDelivery(deliveryId, completionNotes);
    setCompletingDeliveryId(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Driver Assignment & Delivery Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch routes, monitor transit progress, and review fulfillment performance
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDriverId(undefined);
            setIsAssignModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch New Route</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">On Delivery</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-300 tabular-nums">
            {activeDrivers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Drivers on active highway corridors</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Resting / Off-Duty</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {restingDrivers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Mandatory DOT rest hours</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unassigned</span>
            <span className="w-2 h-2 rounded-full bg-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-200 tabular-nums">
            {unassignedDrivers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for route deployment</div>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg w-fit text-xs">
        <button
          onClick={() => setActiveTab('active_missions')}
          className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'active_missions'
              ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Deliveries ({activeDrivers.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'roster'
              ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Driver Roster ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Delivery History ({deliveryLogs.length})
        </button>
      </div>

      {/* 1. ACTIVE MISSIONS VIEW */}
      {activeTab === 'active_missions' && (
        <div className="space-y-4">
          {activeDrivers.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800">
              <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No active delivery routes in progress</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All drivers and transport units are currently resting or available in the yard.
              </p>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
              >
                Dispatch First Route
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeDrivers.map(d => {
                const mission = d.activeDelivery!;
                return (
                  <div
                    key={d.id}
                    className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg hover:border-slate-700 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-100">{d.name}</h3>
                          <span className="text-xs font-mono text-cyan-400 font-semibold">{d.licenseNumber}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Assigned Unit: <strong className="text-slate-200 font-mono">{mission.vehicleId}</strong> ({mission.vehiclePlate})</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        On Delivery
                      </span>
                    </div>

                    {/* Route Corridor */}
                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{mission.origin}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mx-2" />
                        <div className="flex items-center gap-2 min-w-0 justify-end text-right">
                          <span className="truncate font-semibold text-cyan-300">{mission.destination}</span>
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        </div>
                      </div>

                      {/* Cargo specs */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <span>Cargo: {mission.cargoDescription}</span>
                        <span className="font-mono tabular-nums">{mission.cargoWeightKg.toLocaleString()} kg · {mission.distanceKm} km</span>
                      </div>
                    </div>

                    {/* Progress Bar & Interactive Simulation */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Corridor Transit Progress:</span>
                        <span className="font-mono font-bold text-cyan-400">{mission.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${mission.progressPercent}%` }}
                        />
                      </div>

                      {/* Slider to simulate / update live progress */}
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>Update Progress:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mission.progressPercent}
                          onChange={e => updateDeliveryProgress(mission.id, parseInt(e.target.value))}
                          className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                        <button
                          onClick={() => updateDeliveryProgress(mission.id, 100)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                        >
                          Set 100%
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ETA: {mission.estimatedArrival.replace('T', ' ')}
                      </span>

                      <button
                        onClick={() => setCompletingDeliveryId(mission.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Complete Delivery
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. DRIVER ROSTER VIEW */}
      {activeTab === 'roster' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Commercial License</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Vehicle</th>
                  <th className="py-3 px-4 text-right">Lifetime Deliveries</th>
                  <th className="py-3 px-4 text-right">Logged Distance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 whitespace-nowrap">
                      {d.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {d.licenseNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {d.phone}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        d.status === 'On Delivery'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                          : d.status === 'Resting'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {d.currentVehicleId ? (
                        <span className="font-mono text-cyan-400 font-semibold">{d.currentVehicleId}</span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                      {d.completedDeliveriesCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                      {d.totalDistanceKm.toLocaleString()} km
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {d.status !== 'On Delivery' ? (
                        <button
                          onClick={() => {
                            setSelectedDriverId(d.id);
                            setIsAssignModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition-colors"
                        >
                          Dispatch Route
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">En route</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DELIVERY HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Completed Date</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Vehicle Unit</th>
                  <th className="py-3 px-4">Origin / Hub</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4 text-right">Distance (km)</th>
                  <th className="py-3 px-4">Delivery Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {deliveryLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.completedAt}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      {log.driverName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400 whitespace-nowrap">
                      {log.vehicleId} ({log.vehiclePlate})
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {log.origin}
                    </td>
                    <td className="py-3.5 px-4 text-slate-100 font-medium">
                      {log.destination}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                      {log.distanceKm.toLocaleString()} km
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {log.notes || 'Fulfilled without variance'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complete delivery modal */}
      {completingDeliveryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-slate-100">Fulfill & Complete Route</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Completing this mission will credit the driver's logged distance, update the vehicle's odometer, and return unit status to Available.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt & Handover Notes</label>
              <textarea
                rows={2}
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
                placeholder="Cargo verified undamaged by consignee receiving supervisor."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setCompletingDeliveryId(null)}
                className="px-3 py-1.5 text-xs rounded-lg text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteMission(completingDeliveryId)}
                className="px-4 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-900/30"
              >
                Confirm Route Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        preselectedDriverId={selectedDriverId}
      />
    </div>
  );
};
