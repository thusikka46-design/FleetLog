import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Vehicle, 
  Driver, 
  FuelLog, 
  MaintenanceRecord, 
  DeliveryLog, 
  NotificationItem, 
  ActiveDelivery 
} from '../types/fleet';
import { 
  INITIAL_VEHICLES, 
  INITIAL_DRIVERS, 
  INITIAL_FUEL_LOGS, 
  INITIAL_MAINTENANCE, 
  INITIAL_DELIVERY_LOGS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelLogs: FuelLog[];
  maintenanceRecords: MaintenanceRecord[];
  deliveryLogs: DeliveryLog[];
  notifications: NotificationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Quick status indicators
  totalVehicles: number;
  activeDeliveriesCount: number;
  pendingMaintenanceCount: number;
  totalMonthlyFuelSpend: number;
  totalMonthlyMaintenanceSpend: number;
  fleetAverageEfficiency: number;
  unreadNotificationsCount: number;

  // Actions
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  assignDriverToDelivery: (payload: {
    driverId: string;
    vehicleId: string;
    origin: string;
    destination: string;
    cargoDescription: string;
    cargoWeightKg: number;
    distanceKm: number;
    startDate: string;
    estimatedArrival: string;
  }) => void;
  
  completeDelivery: (deliveryId: string, notes?: string) => void;
  updateDeliveryProgress: (deliveryId: string, progress: number) => void;

  addFuelLog: (data: {
    vehicleId: string;
    date: string;
    liters: number;
    totalCost: number;
    currentOdometerKm: number;
    fuelType: string;
    stationName?: string;
  }) => { efficiencyKmPerLiter: number; costPerKm: number };
  deleteFuelLog: (id: string) => void;

  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'status'>) => void;
  completeMaintenance: (id: string, actualCost: number, notes?: string) => void;
  rescheduleMaintenance: (id: string, newDueDate: string, newMileage?: number) => void;

  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  resetToDemoData: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('fleetlog_vehicles');
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem('fleetlog_drivers');
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => {
    try {
      const saved = localStorage.getItem('fleetlog_fuel');
      return saved ? JSON.parse(saved) : INITIAL_FUEL_LOGS;
    } catch {
      return INITIAL_FUEL_LOGS;
    }
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('fleetlog_maintenance');
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
    } catch {
      return INITIAL_MAINTENANCE;
    }
  });

  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>(() => {
    try {
      const saved = localStorage.getItem('fleetlog_delivery_logs');
      return saved ? JSON.parse(saved) : INITIAL_DELIVERY_LOGS;
    } catch {
      return INITIAL_DELIVERY_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('fleetlog_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem('fleetlog_vehicles', JSON.stringify(vehicles));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('fleetlog_drivers', JSON.stringify(drivers));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem('fleetlog_fuel', JSON.stringify(fuelLogs));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [fuelLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('fleetlog_maintenance', JSON.stringify(maintenanceRecords));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [maintenanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('fleetlog_delivery_logs', JSON.stringify(deliveryLogs));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [deliveryLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('fleetlog_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [notifications]);

  // Derived Calculations
  const totalVehicles = vehicles.length;
  const activeDeliveriesCount = vehicles.filter(v => v.status === 'Active').length;
  const pendingMaintenanceCount = maintenanceRecords.filter(m => m.status === 'Pending' || m.status === 'Overdue').length;

  // Monthly Fuel Spend (records with date in current month or recent 30 days)
  const totalMonthlyFuelSpend = fuelLogs.reduce((acc, log) => acc + log.totalCost, 0);

  // Monthly Maintenance Spend
  const totalMonthlyMaintenanceSpend = maintenanceRecords
    .filter(m => m.status === 'Completed' && m.actualCost)
    .reduce((acc, m) => acc + (m.actualCost || 0), 0);

  // Fleet Average Efficiency (km/L)
  const validEfficiencyLogs = fuelLogs.filter(f => f.efficiencyKmPerLiter > 0);
  const fleetAverageEfficiency = validEfficiencyLogs.length > 0
    ? Number((validEfficiencyLogs.reduce((sum, l) => sum + l.efficiencyKmPerLiter, 0) / validEfficiencyLogs.length).toFixed(2))
    : 0;

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Vehicle Management
  const addVehicle = (newVeh: Omit<Vehicle, 'id'>) => {
    // Generate ID
    const prefix = newVeh.type === 'Heavy Truck' ? 'TRK' : 
                   newVeh.type === 'Cargo Van' ? 'VAN' : 
                   newVeh.type === 'Box Truck' ? 'BOX' : 
                   newVeh.type === 'Electric Van' ? 'EV' : 'SED';
    const randNum = Math.floor(100 + Math.random() * 900);
    const id = `${prefix}-${randNum}`;

    const vehicle: Vehicle = {
      ...newVeh,
      id,
    };

    setVehicles(prev => [vehicle, ...prev]);

    // Add notification
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'New Vehicle Registered',
        message: `${vehicle.model} (${vehicle.plateNumber}) added to fleet roster.`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        actionTab: 'fleet',
      },
      ...prev,
    ]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    const veh = vehicles.find(v => v.id === id);
    if (!veh) return;

    // Unassign driver if any
    if (veh.assignedDriverId) {
      setDrivers(prev => prev.map(d => {
        if (d.id === veh.assignedDriverId) {
          return {
            ...d,
            status: 'Unassigned',
            currentVehicleId: undefined,
            currentVehiclePlate: undefined,
            activeDelivery: undefined,
          };
        }
        return d;
      }));
    }

    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Driver & Delivery Assignment
  const assignDriverToDelivery = (payload: {
    driverId: string;
    vehicleId: string;
    origin: string;
    destination: string;
    cargoDescription: string;
    cargoWeightKg: number;
    distanceKm: number;
    startDate: string;
    estimatedArrival: string;
  }) => {
    const driver = drivers.find(d => d.id === payload.driverId);
    const vehicle = vehicles.find(v => v.id === payload.vehicleId);
    if (!driver || !vehicle) return;

    const deliveryId = `DEL-${Math.floor(100 + Math.random() * 900)}`;

    const activeDelivery: ActiveDelivery = {
      id: deliveryId,
      driverId: driver.id,
      driverName: driver.name,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      origin: payload.origin,
      destination: payload.destination,
      cargoDescription: payload.cargoDescription,
      cargoWeightKg: payload.cargoWeightKg,
      distanceKm: payload.distanceKm,
      startDate: payload.startDate,
      estimatedArrival: payload.estimatedArrival,
      progressPercent: 5,
    };

    // Update Driver
    setDrivers(prev => prev.map(d => {
      if (d.id === payload.driverId) {
        return {
          ...d,
          status: 'On Delivery',
          currentVehicleId: vehicle.id,
          currentVehiclePlate: vehicle.plateNumber,
          activeDelivery,
        };
      }
      return d;
    }));

    // Update Vehicle
    setVehicles(prev => prev.map(v => {
      if (v.id === payload.vehicleId) {
        return {
          ...v,
          status: 'Active',
          assignedDriverId: driver.id,
          assignedDriverName: driver.name,
        };
      }
      return v;
    }));

    // Notify
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Delivery Dispatched',
        message: `${driver.name} dispatched with ${vehicle.id} to ${payload.destination}.`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        actionTab: 'drivers',
      },
      ...prev,
    ]);
  };

  const completeDelivery = (deliveryId: string, notes?: string) => {
    const driver = drivers.find(d => d.activeDelivery?.id === deliveryId);
    if (!driver || !driver.activeDelivery) return;

    const delivery = driver.activeDelivery;
    const vehicle = vehicles.find(v => v.id === delivery.vehicleId);

    // Add to historical delivery logs
    const completedLog: DeliveryLog = {
      id: `HIST-${Date.now()}`,
      driverName: driver.name,
      vehicleId: delivery.vehicleId,
      vehiclePlate: delivery.vehiclePlate,
      origin: delivery.origin,
      destination: delivery.destination,
      distanceKm: delivery.distanceKm,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: notes || 'Delivery completed smoothly. Cargo verified upon arrival.',
    };

    setDeliveryLogs(prev => [completedLog, ...prev]);

    // Update driver: status goes to Resting, increments counts
    setDrivers(prev => prev.map(d => {
      if (d.id === driver.id) {
        return {
          ...d,
          status: 'Resting',
          currentVehicleId: undefined,
          currentVehiclePlate: undefined,
          activeDelivery: undefined,
          completedDeliveriesCount: d.completedDeliveriesCount + 1,
          totalDistanceKm: d.totalDistanceKm + delivery.distanceKm,
        };
      }
      return d;
    }));

    // Update vehicle: mileage increases by distanceKm, status Available, unassigned driver
    if (vehicle) {
      const updatedMileage = vehicle.mileageKm + delivery.distanceKm;
      // Check if vehicle has now reached or exceeded its nextServiceMileageKm
      const serviceDue = updatedMileage >= vehicle.nextServiceMileageKm;

      setVehicles(prev => prev.map(v => {
        if (v.id === vehicle.id) {
          return {
            ...v,
            status: serviceDue ? 'In Maintenance' : 'Available',
            assignedDriverId: undefined,
            assignedDriverName: undefined,
            mileageKm: updatedMileage,
          };
        }
        return v;
      }));

      // If service is now due, create an automated pending maintenance item
      if (serviceDue) {
        setMaintenanceRecords(prev => [
          {
            id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
            vehicleId: vehicle.id,
            vehiclePlate: vehicle.plateNumber,
            vehicleModel: vehicle.model,
            serviceType: 'Preventive Interval Service & Diagnostic',
            dueDate: new Date().toISOString().split('T')[0],
            dueMileageKm: vehicle.nextServiceMileageKm,
            urgency: 'High',
            status: 'Pending',
            estimatedCost: 550,
            technicianNotes: `Triggered automatically upon reaching ${updatedMileage.toLocaleString()} km threshold.`,
          },
          ...prev,
        ]);
      }
    }

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Delivery Completed',
        message: `${driver.name} completed route to ${delivery.destination} (${delivery.distanceKm} km).`,
        timestamp: 'Just now',
        type: 'success',
        read: false,
        actionTab: 'drivers',
      },
      ...prev,
    ]);
  };

  const updateDeliveryProgress = (deliveryId: string, progress: number) => {
    setDrivers(prev => prev.map(d => {
      if (d.activeDelivery?.id === deliveryId) {
        return {
          ...d,
          activeDelivery: {
            ...d.activeDelivery,
            progressPercent: Math.min(100, Math.max(0, progress)),
          },
        };
      }
      return d;
    }));
  };

  // Fuel Tracker
  const addFuelLog = (data: {
    vehicleId: string;
    date: string;
    liters: number;
    totalCost: number;
    currentOdometerKm: number;
    fuelType: string;
    stationName?: string;
  }) => {
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const previousOdometerKm = vehicle.mileageKm;
    const distanceTraveled = Math.max(1, data.currentOdometerKm - previousOdometerKm);
    const efficiency = Number((distanceTraveled / (data.liters || 1)).toFixed(2));
    const costPerKm = Number((data.totalCost / distanceTraveled).toFixed(2));

    const newLog: FuelLog = {
      id: `FL-${Date.now().toString().slice(-4)}`,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      vehicleModel: vehicle.model,
      date: data.date,
      liters: data.liters,
      totalCost: data.totalCost,
      currentOdometerKm: data.currentOdometerKm,
      previousOdometerKm,
      efficiencyKmPerLiter: efficiency,
      costPerKm,
      fuelType: data.fuelType,
      stationName: data.stationName || 'Regional Commercial Fueling Station',
    };

    setFuelLogs(prev => [newLog, ...prev]);

    // Update vehicle's odometer if higher
    if (data.currentOdometerKm > vehicle.mileageKm) {
      updateVehicle(vehicle.id, { mileageKm: data.currentOdometerKm });
    }

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Fuel Refill Logged',
        message: `${vehicle.id} refilled with ${data.liters}L (${efficiency} km/L efficiency).`,
        timestamp: 'Just now',
        type: 'success',
        read: false,
        actionTab: 'fuel',
      },
      ...prev,
    ]);

    return { efficiencyKmPerLiter: efficiency, costPerKm };
  };

  const deleteFuelLog = (id: string) => {
    setFuelLogs(prev => prev.filter(f => f.id !== id));
  };

  // Maintenance Management
  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id' | 'status'>) => {
    const id = `MNT-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: MaintenanceRecord = {
      ...record,
      id,
      status: 'Pending',
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Maintenance Scheduled',
        message: `${record.serviceType} scheduled for ${record.vehiclePlate} (${record.dueDate}).`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        actionTab: 'maintenance',
      },
      ...prev,
    ]);
  };

  const completeMaintenance = (id: string, actualCost: number, notes?: string) => {
    const target = maintenanceRecords.find(m => m.id === id);
    if (!target) return;

    const today = new Date().toISOString().split('T')[0];

    setMaintenanceRecords(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'Completed',
          actualCost,
          completedDate: today,
          technicianNotes: notes || m.technicianNotes,
        };
      }
      return m;
    }));

    // Update vehicle status back to Available if it was In Maintenance
    const vehicle = vehicles.find(v => v.id === target.vehicleId);
    if (vehicle) {
      // Calculate next recommended service (+15,000 km)
      const nextMileage = vehicle.mileageKm + 15000;
      updateVehicle(vehicle.id, {
        status: vehicle.status === 'In Maintenance' ? 'Available' : vehicle.status,
        lastServiceDate: today,
        nextServiceMileageKm: nextMileage,
      });
    }

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Maintenance Completed',
        message: `${target.serviceType} on ${target.vehiclePlate} completed ($${actualCost.toFixed(2)}).`,
        timestamp: 'Just now',
        type: 'success',
        read: false,
        actionTab: 'maintenance',
      },
      ...prev,
    ]);
  };

  const rescheduleMaintenance = (id: string, newDueDate: string, newMileage?: number) => {
    setMaintenanceRecords(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          dueDate: newDueDate,
          dueMileageKm: newMileage || m.dueMileageKm,
          status: 'Pending',
        };
      }
      return m;
    }));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetToDemoData = () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setFuelLogs(INITIAL_FUEL_LOGS);
    setMaintenanceRecords(INITIAL_MAINTENANCE);
    setDeliveryLogs(INITIAL_DELIVERY_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem('fleetlog_vehicles');
    localStorage.removeItem('fleetlog_drivers');
    localStorage.removeItem('fleetlog_fuel');
    localStorage.removeItem('fleetlog_maintenance');
    localStorage.removeItem('fleetlog_delivery_logs');
    localStorage.removeItem('fleetlog_notifications');
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        fuelLogs,
        maintenanceRecords,
        deliveryLogs,
        notifications,
        activeTab,
        setActiveTab,
        totalVehicles,
        activeDeliveriesCount,
        pendingMaintenanceCount,
        totalMonthlyFuelSpend,
        totalMonthlyMaintenanceSpend,
        fleetAverageEfficiency,
        unreadNotificationsCount,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        assignDriverToDelivery,
        completeDelivery,
        updateDeliveryProgress,
        addFuelLog,
        deleteFuelLog,
        addMaintenanceRecord,
        completeMaintenance,
        rescheduleMaintenance,
        markAllNotificationsRead,
        dismissNotification,
        resetToDemoData,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
