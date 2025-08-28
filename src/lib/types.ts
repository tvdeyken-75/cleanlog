export interface ContaminationDetails {
  types: string[];
  description: string;
  corrective_actions: string;
}

export type ProtocolType = 'cleaning' | 'fuel' | 'pause';

export interface Tour {
  truck_license_plate: string;
  trailer_license_plate: string;
  transport_order: string;
}

interface BaseProtocol extends Tour {
    id: string;
    driverId: string;
    type: ProtocolType;
    location: string;
    start_time: string;
    end_time: string;
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


export type Protocol = CleaningProtocol | FuelProtocol | PauseProtocol;
