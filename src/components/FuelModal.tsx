import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { X, Fuel, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';

interface FuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: string;
}

export const FuelModal: React.FC<FuelModalProps> = ({
  isOpen,
  onClose,
  preselectedVehicleId,
}) => {
  const { vehicles, addFuelLog } = useFleet();

  const [vehicleId, setVehicleId] = useState(preselectedVehicleId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState<number | ''>(85);
  const [totalCost, setTotalCost] = useState<number | ''>(340);
  const [currentOdometerKm, setCurrentOdometerKm] = useState<number | ''>('');
  const [stationName, setStationName] = useState('TravelCenters of America - Terminal Fuel');
  const [errorMessage, setErrorMessage] = useState('');
  const [calculationResult, setCalculationResult] = useState<{
    efficiency: number;
    distance: number;
    costPerKm: number;
  } | null>(null);

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    if (preselectedVehicleId) {
      setVehicleId(preselectedVehicleId);
    } else if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [preselectedVehicleId, vehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      // Suggest an odometer reading that reflects recent transit (e.g. +400 to 600 km)
      const suggestedOdo = selectedVehicle.mileageKm + 520;
      setCurrentOdometerKm(suggestedOdo);
    }
  }, [vehicleId]);

  // Dynamic live calculation of efficiency and cost/km
  useEffect(() => {
    if (!selectedVehicle || typeof currentOdometerKm !== 'number' || typeof liters !== 'number' || typeof totalCost !== 'number') {
      setCalculationResult(null);
      return;
    }

    if (currentOdometerKm <= selectedVehicle.mileageKm || liters <= 0) {
      setCalculationResult(null);
      return;
    }

    const distance = currentOdometerKm - selectedVehicle.mileageKm;
    const efficiency = Number((distance / liters).toFixed(2));
    const costPerKm = Number((totalCost / distance).toFixed(2));

    setCalculationResult({
      efficiency,
      distance,
      costPerKm,
    });
  }, [selectedVehicle, currentOdometerKm, liters, totalCost]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedVehicle) {
      setErrorMessage('Please select a vehicle.');
      return;
    }

    if (typeof liters !== 'number' || liters <= 0) {
      setErrorMessage('Please enter a valid fuel amount in liters.');
      return;
    }

    if (typeof totalCost !== 'number' || totalCost <= 0) {
      setErrorMessage('Please enter a valid total cost.');
      return;
    }

    if (typeof currentOdometerKm !== 'number' || currentOdometerKm < selectedVehicle.mileageKm) {
      setErrorMessage(`Odometer reading must be equal to or greater than current vehicle reading (${selectedVehicle.mileageKm.toLocaleString()} km).`);
      return;
    }

    try {
      addFuelLog({
        vehicleId: selectedVehicle.id,
        date,
        liters,
        totalCost,
        currentOdometerKm,
        fuelType: selectedVehicle.fuelType,
        stationName,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit fuel log');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Log Fuel Refill</h3>
              <p className="text-xs text-slate-400">Record pump volumes, expenditure & compute efficiency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Vehicle Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Fleet Unit</label>
            <select
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id} · {v.model} ({v.plateNumber}) · {v.mileageKm.toLocaleString()} km
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Refill Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Current Odometer */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Odometer (km)
                {selectedVehicle && (
                  <span className="text-[11px] text-slate-500 ml-1">
                    (Prev: {selectedVehicle.mileageKm.toLocaleString()} km)
                  </span>
                )}
              </label>
              <input
                type="number"
                min={selectedVehicle ? selectedVehicle.mileageKm : 0}
                value={currentOdometerKm}
                onChange={e => setCurrentOdometerKm(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder={selectedVehicle ? `${selectedVehicle.mileageKm + 500}` : 'Odometer'}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Liters */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fuel Added ({selectedVehicle?.fuelType.includes('Electric') ? 'kWh' : 'Liters'})
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={liters}
                onChange={e => setLiters(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Total Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Refill Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={totalCost}
                onChange={e => setTotalCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Station Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Station / Vendor Location</label>
            <input
              type="text"
              value={stationName}
              onChange={e => setStationName(e.target.value)}
              placeholder="e.g. Pilot Flying J #412"
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Dynamic Live Calculation Card */}
          {calculationResult && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  Auto-Calculated Efficiency:
                </span>
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  {calculationResult.efficiency} km/L
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div>
                  <span>Leg Distance: </span>
                  <span className="font-mono font-semibold text-slate-200">
                    +{calculationResult.distance.toLocaleString()} km
                  </span>
                </div>
                <div className="text-right">
                  <span>Operating Cost: </span>
                  <span className="font-mono font-semibold text-emerald-400">
                    ${calculationResult.costPerKm}/km
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-900/30 transition-colors"
            >
              Submit Fuel Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
