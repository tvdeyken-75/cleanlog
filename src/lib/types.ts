

export type UserRole = 'driver' | 'admin';

export interface User {
    username: string;
    password?: string; // Password might not always be present on client
    role: UserRole;
}

export interface ContaminationDetails {
  types: string[];
  description: string;
  corrective_actions: string;
}

export type ProtocolType = 'cleaning' | 'fuel' | 'pause' | 'loading' | 'delivery' | 'emergency' | 'maintenance';

export interface Tour {
  truck_license_plate: string;
  trailer_license_plate: string;
  transport_order: string;
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
  photos?: Photo[];
}

export interface FuelProtocol extends BaseProtocol {
    type: 'fuel';
    liters: number;
    cargo_area_closed: boolean;
    has_seal: boolean;
    cargo_area_temperature: number;
}

export interface PauseProtocol extends BaseProtocol {
    type: 'pause';
    duration: number; // in minutes
    message: string;
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
  required_temperature: number;
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
    message: string;
    cargo_area_closed: boolean;
    has_seal: boolean;
    cargo_area_temperature: number;
    photos?: Photo[];
}

export type EmergencyType = 'vehicle-damage' | 'goods-blocked' | 'personal-injury' | 'delay' | 'break-in' | 'health-incident' | 'breakdown' | 'other';

export interface EmergencyProtocol extends BaseProtocol {
    type: 'emergency';
    emergency_type: EmergencyType;
    description: string;
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


export type Protocol = CleaningProtocol | FuelProtocol | PauseProtocol | LoadingProtocol | DeliveryProtocol | EmergencyProtocol | MaintenanceProtocol;


    
