export interface Device {
    id: number;                // Django model primary key (auto-created)
    device_id: string;         // e.g. 'device1'
    name: string;              // optional in UI, but exists in DB
    location: string;
    status: 'active' | 'inactive' | string;  // assuming status is an open enum
}
  
export interface SensorReading {
    id: number;
    device: number | Device;   // might be just the ID or a nested object if expanded
    timestamp: string;         // ISO 8601 datetime from Django

    temperature?: number | null;
    humidity?: number | null;
    light?: number | null;
    air_quality?: number | null;
    soil_moisture?: number | null;
}
  