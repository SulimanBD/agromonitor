// src/lib/api.ts
import type { Device } from './types';

export async function fetchDevices(): Promise<Device[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/api/devices/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized response
      localStorage.removeItem('access_token');
      window.location.assign('/login'); // Redirect to login page
      return [];
    }
    throw new Error('Failed to fetch devices');
  }

  const data = await response.json();

  // Return the `results` array from the API response
  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  throw new Error('Unexpected API response format: devices should be in `results`');
}

import type { SensorReading } from './types';

export async function fetchSingleDeviceData(deviceId: string, start: string, end: string): Promise<SensorReading[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  // Convert start and end to GMT+1
  const startGMTPlus1 = new Date(new Date(start).getTime() + 1 * 60 * 60 * 1000).toISOString();
  const endGMTPlus1 = new Date(new Date(end).getTime() + 1 * 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/readings/sngl_dvc_mult_sensor/?device__device_id=${deviceId}&start=${startGMTPlus1}&end=${endGMTPlus1}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized response
      localStorage.removeItem("access_token"); // Clear invalid token
      window.location.assign('/login'); // Redirect to login page
      return [];
    }
    throw new Error("Failed to fetch sensor data");
  }

  return await response.json();
}

export async function fetchMultiDeviceSensorData(
  deviceIds: string[],
  sensorType: string,
  start: string,
  end: string
): Promise<{ timestamp: string; device_id: string; avg_value: number }[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const queryParams = new URLSearchParams({
    sensor_type: sensorType,
    start,
    end,
  });

  // Add device IDs to the query parameters
  deviceIds.forEach((id) => queryParams.append('device_ids[]', id));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/readings/mult_dvcs_sngl_sensor/?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch multi-device sensor data');
  }

  return await response.json();
}