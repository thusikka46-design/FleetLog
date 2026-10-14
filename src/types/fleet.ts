export type VehicleStatus = 'Active' | 'Available' | 'In Maintenance';

export type VehicleType = 
  | 'Heavy Truck'
  | 'Cargo Van'
  | 'Box Truck'
  | 'Delivery Sedan'
  | 'Electric Van';

export interface Vehicle {
  id: string; // e.g. TRK-101
  plateNumber: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  mileageKm: number;
  fuelCapacityLiters: number;
  fuelType: 'Diesel' | 'Unleaded' | 'Electric (kWh)';
  lastServiceDate: string;
  nextServiceMileageKm: number;
  avatarIcon?: string;
}

export type DriverStatus = 'On Delivery' | 'Resting' | 'Unassigned';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: DriverStatus;
  currentVehicleId?: string;
  currentVehiclePlate?: string;
  activeDelivery?: ActiveDelivery;
  completedDeliveriesCount: number;
  totalDistanceKm: number;
}

export interface ActiveDelivery {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoWeightKg: number;
  distanceKm: number;
  startDate: string;
  estimatedArrival: string;
  progressPercent: number; // 0 - 100
}

export interface DeliveryLog {
  id: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  origin: string;
  destination: string;
  distanceKm: number;
  completedAt: string;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  date: string;
  liters: number;
  totalCost: number;
  currentOdometerKm: number;
  previousOdometerKm: number;
  efficiencyKmPerLiter: number;
  costPerKm: number;
  fuelType: string;
  stationName?: string;
}

export type MaintenanceUrgency = 'High' | 'Medium' | 'Low';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  serviceType: string;
  dueDate: string;
  dueMileageKm: number;
  urgency: MaintenanceUrgency;
  status: 'Pending' | 'Completed' | 'Overdue';
  estimatedCost: number;
  actualCost?: number;
  completedDate?: string;
  technicianNotes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
  actionTab?: string;
}

export interface MonthlyExpense {
  month: string;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
}
