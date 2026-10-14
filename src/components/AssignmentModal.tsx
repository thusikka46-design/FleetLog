import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { X, Send, MapPin, Truck, Calendar, Package } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDriverId?: string;
  preselectedVehicleId?: string;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDriverId,
  preselectedVehicleId,
}) => {
  const { drivers, vehicles, assignDriverToDelivery } = useFleet();

  const availableDrivers = drivers.filter(d => d.status !== 'On Delivery');
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  const [driverId, setDriverId] = useState(
    preselectedDriverId || (availableDrivers[0] ? availableDrivers[0].id : (drivers[0]?.id || ''))
  );
  const [vehicleId, setVehicleId] = useState(
    preselectedVehicleId || (availableVehicles[0] ? availableVehicles[0].id : (vehicles[0]?.id || ''))
  );
  const [origin, setOrigin] = useState('Chicago Central Logistics Hub, IL');
  const [destination, setDestination] = useState('Cleveland Freight Terminal, OH');
  const [distanceKm, setDistanceKm] = useState<number>(550);
  const [cargoDescription, setCargoDescription] = useState('Industrial Machinery Spare Assemblies');
  const [cargoWeightKg, setCargoWeightKg] = useState<number>(6800);
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 16));
  
  // Set estimated arrival 8 hours later
  const [estimatedArrival, setEstimatedArrival] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 8);
    return d.toISOString().substring(0, 16);
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!driverId) {
      setError('Please select an eligible driver.');
      return;
    }
    if (!vehicleId) {
      setError('Please select an available vehicle.');
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      setError('Origin and destination routes are required.');
      return;
    }
    if (distanceKm <= 0) {
      setError('Distance must be greater than 0 km.');
      return;
    }

    assignDriverToDelivery({
      driverId,
      vehicleId,
      origin: origin.trim(),
      destination: destination.trim(),
      cargoDescription: cargoDescription.trim() || 'General Commercial Freight',
      cargoWeightKg,
      distanceKm,
      startDate,
      estimatedArrival,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Dispatch Delivery Mission</h3>
              <p className="text-xs text-slate-400">Assign vehicle, certified driver, cargo manifest & route</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Driver Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Commercial Driver
              </label>
              <select
                value={driverId}
                onChange={e => setDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {availableDrivers.length === 0 ? (
                  <option value="" disabled>No resting/unassigned drivers</option>
                ) : (
                  availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status}) · {d.licenseNumber}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Vehicle Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Transport Vehicle
              </label>
              <select
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {availableVehicles.length === 0 ? (
                  <option value="" disabled>No available vehicles in yard</option>
                ) : (
                  availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.id} · {v.model} ({v.plateNumber})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dispatch Origin</label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dropoff Destination</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cargo Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Manifest Cargo Description</label>
              <input
                type="text"
                value={cargoDescription}
                onChange={e => setCargoDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Cargo Weight & Distance */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={cargoWeightKg}
                  onChange={e => setCargoWeightKg(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Route (km)</label>
                <input
                  type="number"
                  min="1"
                  value={distanceKm}
                  onChange={e => setDistanceKm(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Departure */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Departure Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Estimated Arrival */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Arrival (ETA)</label>
              <input
                type="datetime-local"
                value={estimatedArrival}
                onChange={e => setEstimatedArrival(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
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
              disabled={availableDrivers.length === 0 || availableVehicles.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-lg shadow-emerald-900/30 transition-colors"
            >
              Dispatch Driver & Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
