export interface ContaminationDetails {
  types: string[];
  description: string;
  corrective_actions: string;
}

export interface Protocol {
  id: string;
  driverId: string;
  truck_license_plate: string;
  trailer_license_plate: string;
  cleaning_type: string;
  cleaning_products: string;
  control_type: string;
  control_result: 'i.O.' | 'n.i.O.';
  contamination_details?: ContaminationDetails;
  location: string;
  water_temperature: number;
  water_quality: string;
  start_time: string;
  end_time: string;
}
