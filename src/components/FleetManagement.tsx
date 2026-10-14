import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Vehicle, VehicleStatus, VehicleType } from '../types/fleet';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Wrench, 
  Trash2, 
  Fuel, 
  Calendar, 
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers
} from 'lucide-react';
import { VehicleModal } from './VehicleModal';
import { MaintenanceHistoryModal } from './MaintenanceHistoryModal';
import { MaintenanceModal } from './MaintenanceModal';

export const FleetManagement: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, setActiveTab } = useFleet();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'id' | 'mileageKm' | 'status'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [historyVehicle, setHistoryVehicle] = useState<Vehicle | null>(null);
  const [schedulingVehicle, setSchedulingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort
  const filteredVehicles = vehicles
    .filter(v => {
      const matchesSearch = 
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesType = typeFilter === 'All' || v.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortField === 'mileageKm') {
        return sortOrder === 'asc' ? a.mileageKm - b.mileageKm : b.mileageKm - a.mileageKm;
      }
      if (sortField === 'status') {
        return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      }
      return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });

  const toggleSort = (field: 'id' | 'mileageKm' | 'status') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const activeCount = vehicles.filter(v => v.status === 'Active').length;
  const availableCount = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'In Maintenance').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Fleet & Vehicle Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status tracking, asset profiles, and maintenance history across all units
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Fleet Units</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {vehicles.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across 5 vehicle classifications</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Available in Yard</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {availableCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for route dispatch</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">Active On Road</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Currently fulfilling cargo deliveries</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Under Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {maintenanceCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">In shop for scheduled or repair work</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by ID, plate, model, or driver..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Filter segment controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status select */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Statuses</option>
                <option value="Available" className="bg-slate-900 text-slate-200">Available</option>
                <option value="Active" className="bg-slate-900 text-slate-200">Active</option>
                <option value="In Maintenance" className="bg-slate-900 text-slate-200">In Maintenance</option>
              </select>
            </div>

            {/* Type select */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Types</option>
                <option value="Heavy Truck" className="bg-slate-900 text-slate-200">Heavy Truck</option>
                <option value="Cargo Van" className="bg-slate-900 text-slate-200">Cargo Van</option>
                <option value="Box Truck" className="bg-slate-900 text-slate-200">Box Truck</option>
                <option value="Delivery Sedan" className="bg-slate-900 text-slate-200">Delivery Sedan</option>
                <option value="Electric Van" className="bg-slate-900 text-slate-200">Electric Van</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'All' || typeFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setTypeFilter('All');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles Data Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3 px-4">
                  <button 
                    onClick={() => toggleSort('id')} 
                    className="flex items-center gap-1 hover:text-slate-200 focus:outline-none"
                  >
                    <span>Vehicle ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-4">Plate Number</th>
                <th className="py-3 px-4">Model & Classification</th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => toggleSort('status')} 
                    className="flex items-center gap-1 hover:text-slate-200 focus:outline-none"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4 text-right">
                  <button 
                    onClick={() => toggleSort('mileageKm')} 
                    className="flex items-center gap-1 ml-auto hover:text-slate-200 focus:outline-none"
                  >
                    <span>Odometer (km)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">Fuel Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No vehicles found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(v => {
                  const isMaintenanceDue = v.mileageKm >= (v.nextServiceMileageKm || 999999);

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Vehicle ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {v.id}
                      </td>

                      {/* Plate Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-200 whitespace-nowrap font-medium">
                        {v.plateNumber}
                      </td>

                      {/* Model & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 leading-snug">{v.model}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {v.type} · {v.year}
                        </div>
                      </td>

                      {/* Current Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                          v.status === 'Active'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                            : v.status === 'In Maintenance'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            v.status === 'Active' ? 'bg-emerald-400' :
                            v.status === 'In Maintenance' ? 'bg-rose-400' : 'bg-slate-400'
                          }`} />
                          {v.status}
                        </span>
                      </td>

                      {/* Assigned Driver */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {v.assignedDriverName ? (
                          <div className="font-medium text-slate-200">{v.assignedDriverName}</div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Mileage */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium tabular-nums whitespace-nowrap">
                        <span className="text-slate-200">{v.mileageKm.toLocaleString()}</span>
                        <span className="text-slate-500 text-[11px] ml-1">km</span>
                        {isMaintenanceDue && (
                          <span className="block text-[10px] text-rose-400 font-sans font-medium">Service Due!</span>
                        )}
                      </td>

                      {/* Fuel Type */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-400 text-[11px]">
                        {v.fuelType}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Maintenance History */}
                          <button
                            onClick={() => setHistoryVehicle(v)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="View Maintenance History"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => setEditingVehicle(v)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Edit Vehicle Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Vehicle */}
                          <button
                            onClick={() => setDeleteConfirmId(v.id)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-slate-100">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove unit <strong className="text-white font-mono">{deleteConfirmId}</strong> from the fleet roster? Any assigned driver will be reset to Unassigned.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs rounded-lg text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteVehicle(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 font-semibold text-white"
              >
                Delete Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <VehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addVehicle}
      />

      <VehicleModal
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        initialVehicle={editingVehicle}
        onSubmit={() => {}}
        onUpdate={updateVehicle}
      />

      <MaintenanceHistoryModal
        vehicle={historyVehicle}
        isOpen={!!historyVehicle}
        onClose={() => setHistoryVehicle(null)}
        onScheduleNew={v => {
          setHistoryVehicle(null);
          setSchedulingVehicle(v);
        }}
      />

      <MaintenanceModal
        isOpen={!!schedulingVehicle}
        onClose={() => setSchedulingVehicle(null)}
        preselectedVehicle={schedulingVehicle}
      />
    </div>
  );
};
