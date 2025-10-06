

export type UserRole = 'driver' | 'admin' | 'disponent' | 'geschaftsfuhrer' | 'buchhaltung' | 'qm_manager';

export interface User {
    username: string;
    password?: string; // Password might not always be present on client
    role: UserRole[];
}

export interface Vehicle {
  license_plate: string;
  maintenance_number: string;
  api_key?: string;
  active: boolean;
}

export interface ContaminationDetails {
  types: string[];
  description: string;
  corrective_actions: string;
}

export type ProtocolType = 'cleaning' | 'fuel' | 'pause' | 'loading' | 'delivery' | 'emergency' | 'maintenance' | 'expense';

export interface Tour {
  tourNr: string;
  driver: string;
  truck: string;
  trailer: string;
  customer: string;
  description?: string;
  remarks?: string;
  customerRef?: string;
  start_time?: Date;
  end_time?: Date;
  rohertrag?: number;
  anSub?: number;
  km?: number;
  df?: number;
  maut?: number;
  rechnungsnummer?: string;
  rechnungRaus?: boolean;
  bezahlt?: boolean;
  bezahldatum?: Date;
  transport_order?: string; 
  truck_license_plate?: string;
  trailer_license_plate?: string;
}

export interface Photo {
    dataUrl: string; // data URI
    mimeType: string;
}

interface BaseProtocol {
    id: string;
    driverId: string;
    type: ProtocolType;
    location: string;
    start_time: string; // Should be part of all protocols for consistency
    end_time: string;
    truck_license_plate?: string;
    trailer_license_plate?: string;
    transport_order?: string;
}

export interface CleaningProtocol extends BaseProtocol {
  type: 'cleaning';
  cleaning_type: string;
  cleaning_products: string;
  control_type: string;
  control_result: 'i.O.' | 'n.i.O.';
  contamination_details?: ContaminationDetails;
  water_temperature: number;
  water_quality: string;
  odometer_reading: number;
  photos?: Photo[];
}

export interface FuelProtocol extends BaseProtocol {
    type: 'fuel';
    liters: number;
    odometer_reading: number;
    cargo_area_closed: boolean;
    has_seal: boolean;
    cargo_area_temperature: number;
}

export interface PauseProtocol extends BaseProtocol {
    type: 'pause';
    duration: number; // in minutes
    message: string;
    odometer_reading: number;
    cargo_area_closed: boolean;
    has_seal: boolean;
    cargo_area_temperature: number;
}

export type GoodsType = 'food' | 'non-food' | 'empties';

export interface LoadingProtocol extends BaseProtocol {
  type: 'loading';
  loading_protocol_number: string;
  goods_type: GoodsType;
  articles?: string;
  articles_other?: string;
  quantity?: number;
  packaging?: string;
  weight?: number;
  pallets?: number;
  crates?: number;
  required_temperature_min?: number;
  required_temperature_max?: number;
  odometer_reading: number;
  duration: number;
  cargo_area_closed: boolean;
  has_seal: boolean;
  cargo_area_temperature: number;
  photos?: Photo[];
}

export interface DeliveryProtocol extends BaseProtocol {
    type: 'delivery';
    loading_protocol_number: string;
    unloading_duration: number;
    odometer_reading: number;
    message: string;
    cargo_area_closed: boolean;
    has_seal: boolean;
    cargo_area_temperature: number;
    photos?: Photo[];
    pallets?: number;
    crates?: number;
}

export type EmergencyType = 'vehicle-damage' | 'goods-blocked' | 'personal-injury' | 'delay' | 'break-in' | 'health-incident' | 'breakdown' | 'other';

export interface EmergencyProtocol extends BaseProtocol {
    type: 'emergency';
    emergency_type: EmergencyType;
    description: string;
    actions_taken: string;
    photos: Photo[];
    // Conditional fields
    reference_number?: string; // For vehicle damage, goods blocked
    incident_type_description?: string; // For personal injury, health incident
    help_called?: boolean; // For personal injury, health incident
    estimated_duration?: number; // For delay, breakdown
    vehicle_immobile?: boolean; // For delay, breakdown
}

export interface MaintenanceProtocol extends BaseProtocol {
    type: 'maintenance';
    maintenance_type: 'Eigenleistung' | 'Werkstatt';
    reason: string;
    description: string;
    duration: number; // in minutes
    odometer_reading?: number;
    documents?: Photo[];
}

export type ExpenseType = 'parking' | 'toll' | 'ferry' | 'overnight' | 'food' | 'other';

export interface ExpenseProtocol extends BaseProtocol {
    type: 'expense';
    expense_type: ExpenseType;
    amount: number;
    description?: string;
    photos?: Photo[];
}


export type Protocol = CleaningProtocol | FuelProtocol | PauseProtocol | LoadingProtocol | DeliveryProtocol | EmergencyProtocol | MaintenanceProtocol | ExpenseProtocol;
