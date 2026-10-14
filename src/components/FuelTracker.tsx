import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { 
  Fuel, 
  Plus, 
  TrendingUp, 
  Gauge, 
  DollarSign, 
  Trash2, 
  Search, 
  Award, 
  Droplet,
  Truck
} from 'lucide-react';
import { FuelModal } from './FuelModal';

export const FuelTracker: React.FC = () => {
  const { 
    vehicles, 
    fuelLogs, 
    deleteFuelLog, 
    fleetAverageEfficiency, 
    totalMonthlyFuelSpend 
  } = useFleet();

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All');

  // Compute total volume
  const totalFuelLiters = fuelLogs.reduce((acc, log) => acc + log.liters, 0);

  // Compute average cost per km
  const validCostPerKmLogs = fuelLogs.filter(f => f.costPerKm > 0);
  const avgCostPerKm = validCostPerKmLogs.length > 0
    ? (validCostPerKmLogs.reduce((sum, l) => sum + l.costPerKm, 0) / validCostPerKmLogs.length).toFixed(2)
    : '0.00';

  // Compute top efficient vehicle
  // Group logs by vehicle and calculate average efficiency
  const vehicleStats: { [vehicleId: string]: { model: string; plate: string; totalKmPerL: number; count: number } } = {};
  fuelLogs.forEach(l => {
    if (!vehicleStats[l.vehicleId]) {
      vehicleStats[l.vehicleId] = { model: l.vehicleModel, plate: l.vehiclePlate, totalKmPerL: 0, count: 0 };
    }
    if (l.efficiencyKmPerLiter > 0) {
      vehicleStats[l.vehicleId].totalKmPerL += l.efficiencyKmPerLiter;
      vehicleStats[l.vehicleId].count += 1;
    }
  });

  const rankedVehicles = Object.entries(vehicleStats)
    .map(([id, data]) => ({
      id,
      model: data.model,
      plate: data.plate,
      avgEfficiency: data.count > 0 ? Number((data.totalKmPerL / data.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.avgEfficiency - a.avgEfficiency);

  const topVehicle = rankedVehicles[0];

  // Filter fuel logs
  const filteredLogs = fuelLogs.filter(l => {
    const matchesSearch = 
      l.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.stationName && l.stationName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVehicle = selectedVehicleFilter === 'All' || l.vehicleId === selectedVehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Fuel Efficiency Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated km/L consumption auditing, odometer reconciliation & fueling expenditures
          </p>
        </div>

        <button
          onClick={() => setIsFuelModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Fuel Refill</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Fleet Average km/L */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Fleet Average Efficiency</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {fleetAverageEfficiency} <span className="text-sm font-sans font-medium text-slate-400">km/L</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all logged trip legs</div>
        </div>

        {/* Top Efficient Vehicle */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Top Efficient Unit</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-300 truncate">
            {topVehicle ? `${topVehicle.id} (${topVehicle.avgEfficiency} km/L)` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {topVehicle ? topVehicle.model : 'Awaiting refill data'}
          </div>
        </div>

        {/* Total Liters */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Volume Pumped</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-300 tabular-nums">
            {totalFuelLiters.toLocaleString()} <span className="text-sm font-sans font-medium text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Commercial fleet fuel intake</div>
        </div>

        {/* Total Monthly Spend */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Fuel Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ${totalMonthlyFuelSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Avg ${avgCostPerKm}/km operational cost</div>
        </div>
      </div>

      {/* Vehicle Efficiency Comparison Cards */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Vehicle Efficiency Comparison (km/L by Unit)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Ranked by fuel economy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rankedVehicles.map(veh => {
            const isHeavyTruck = veh.model.toLowerCase().includes('cascadia') || veh.model.toLowerCase().includes('vnl') || veh.model.toLowerCase().includes('peterbilt');
            const benchmark = isHeavyTruck ? 3.5 : 9.0;
            const isAboveAverage = veh.avgEfficiency >= benchmark;

            return (
              <div
                key={veh.id}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{veh.id}</span>
                    <span className="text-[11px] text-slate-400">{veh.plate}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-300 mt-0.5 truncate max-w-[170px]">
                    {veh.model}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-base text-slate-100 tabular-nums">
                    {veh.avgEfficiency} <span className="text-xs font-normal text-slate-400">km/L</span>
                  </div>
                  <span className={`text-[10px] font-medium ${isAboveAverage ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isAboveAverage ? 'Optimal Range' : 'Moderate Burn'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Fuel Logs Table */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by station, vehicle plate, or model..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Vehicle unit selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Unit:</span>
            <select
              value={selectedVehicleFilter}
              onChange={e => setSelectedVehicleFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Units</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.id} - {v.model}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Refills Table */}
        <div className="rounded-xl border border-slate-800 overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Refill Date</th>
                  <th className="py-3 px-4">Vehicle Unit</th>
                  <th className="py-3 px-4 text-right">Volume (L)</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-right">Odometer (km)</th>
                  <th className="py-3 px-4 text-right">Efficiency</th>
                  <th className="py-3 px-4 text-right">Cost/km</th>
                  <th className="py-3 px-4">Fueling Location</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-500">
                      No fuel refill records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-cyan-400">{log.vehicleId}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({log.vehiclePlate})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                        {log.liters.toFixed(1)} L
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-400">
                        ${log.totalCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        {log.currentOdometerKm.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-cyan-300">
                        {log.efficiencyKmPerLiter > 0 ? `${log.efficiencyKmPerLiter} km/L` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                        ${log.costPerKm.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[180px]">
                        {log.stationName}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteFuelLog(log.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Refill Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fuel Refill Modal */}
      <FuelModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
      />
    </div>
  );
};
