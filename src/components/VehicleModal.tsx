import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleType, VehicleStatus } from '../types/fleet';
import { X, Truck, AlertCircle } from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<Vehicle>) => void;
  initialVehicle?: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  initialVehicle,
}) => {
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [type, setType] = useState<VehicleType>('Heavy Truck');
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [mileageKm, setMileageKm] = useState<number>(50000);
  const [fuelCapacityLiters, setFuelCapacityLiters] = useState<number>(250);
  const [fuelType, setFuelType] = useState<'Diesel' | 'Unleaded' | 'Electric (kWh)'>('Diesel');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [nextServiceMileageKm, setNextServiceMileageKm] = useState<number>(65000);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialVehicle) {
      setModel(initialVehicle.model);
      setPlateNumber(initialVehicle.plateNumber);
      setYear(initialVehicle.year);
      setType(initialVehicle.type);
      setStatus(initialVehicle.status);
      setMileageKm(initialVehicle.mileageKm);
      setFuelCapacityLiters(initialVehicle.fuelCapacityLiters);
      setFuelType(initialVehicle.fuelType);
      setLastServiceDate(initialVehicle.lastServiceDate || '');
      setNextServiceMileageKm(initialVehicle.nextServiceMileageKm || initialVehicle.mileageKm + 15000);
    } else {
      setModel('');
      setPlateNumber('');
      setYear(2024);
      setType('Heavy Truck');
      setStatus('Available');
      setMileageKm(50000);
      setFuelCapacityLiters(250);
      setFuelType('Diesel');
      setLastServiceDate(new Date().toISOString().split('T')[0]);
      setNextServiceMileageKm(65000);
    }
    setErrors({});
  }, [initialVehicle, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!model.trim()) errs.model = 'Model name is required';
    if (!plateNumber.trim()) errs.plateNumber = 'License plate number is required';
    if (mileageKm < 0 || isNaN(mileageKm)) errs.mileageKm = 'Valid odometer reading required';
    if (fuelCapacityLiters <= 0 || isNaN(fuelCapacityLiters)) errs.fuelCapacityLiters = 'Capacity must be greater than 0';
    if (nextServiceMileageKm <= mileageKm) errs.nextServiceMileageKm = 'Next service mileage should exceed current mileage';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialVehicle && onUpdate) {
      onUpdate(initialVehicle.id, {
        model,
        plateNumber: plateNumber.toUpperCase().trim(),
        year,
        type,
        status,
        mileageKm,
        fuelCapacityLiters,
        fuelType,
        lastServiceDate,
        nextServiceMileageKm,
      });
    } else {
      onSubmit({
        model,
        plateNumber: plateNumber.toUpperCase().trim(),
        year,
        type,
        status,
        mileageKm,
        fuelCapacityLiters,
        fuelType,
        lastServiceDate,
        nextServiceMileageKm,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {initialVehicle ? `Edit Vehicle: ${initialVehicle.id}` : 'Register New Vehicle'}
              </h3>
              <p className="text-xs text-slate-400">
                {initialVehicle ? 'Update fleet specifications and operational status' : 'Add a commercial transport asset to active roster'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Make & Model <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Freightliner Cascadia"
                className={`w-full px-3 py-2 rounded-lg bg-slate-800/80 border text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
                  errors.model ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.model && <p className="text-[11px] text-rose-400 mt-1">{errors.model}</p>}
            </div>

            {/* License Plate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plate Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                placeholder="e.g. IL-8492-X"
                className={`w-full px-3 py-2 rounded-lg bg-slate-800/80 border text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all uppercase ${
                  errors.plateNumber ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.plateNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.plateNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Classification</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Heavy Truck">Heavy Truck (Class 8)</option>
                <option value="Cargo Van">Cargo Van</option>
                <option value="Box Truck">Box Truck</option>
                <option value="Delivery Sedan">Delivery Sedan</option>
                <option value="Electric Van">Electric Van</option>
              </select>
            </div>

            {/* Model Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model Year</label>
              <input
                type="number"
                min="2010"
                max="2027"
                value={year}
                onChange={e => setYear(parseInt(e.target.value) || 2024)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Current Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fleet Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as VehicleStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Available">Available for Dispatch</option>
                <option value="Active">Active (On Delivery)</option>
                <option value="In Maintenance">In Maintenance / Repair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Mileage */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={mileageKm}
                onChange={e => setMileageKm(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.mileageKm && <p className="text-[11px] text-rose-400 mt-1">{errors.mileageKm}</p>}
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Powertrain / Fuel</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Diesel">Ultra-Low Sulfur Diesel</option>
                <option value="Unleaded">Unleaded Gasoline</option>
                <option value="Electric (kWh)">Pure Electric (kWh)</option>
              </select>
            </div>

            {/* Fuel Capacity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tank/Battery Capacity ({fuelType.includes('Electric') ? 'kWh' : 'L'})
              </label>
              <input
                type="number"
                min="10"
                value={fuelCapacityLiters}
                onChange={e => setFuelCapacityLiters(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Last Service Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Completed Service Date</label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={e => setLastServiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Next Service Mileage */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Next Service Target (km)</label>
              <input
                type="number"
                min={mileageKm}
                value={nextServiceMileageKm}
                onChange={e => setNextServiceMileageKm(parseInt(e.target.value) || mileageKm + 10000)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.nextServiceMileageKm && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.nextServiceMileageKm}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {initialVehicle ? 'Save Vehicle Updates' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
