// src/lib/api.ts
import type { Device } from './types';

export async function fetchDevice(id: string): Promise<Device> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/devices/${id}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch device (${id}): ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function fetchDevices(): Promise<Device[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/devices/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // optional: disable caching if you want fresh data every time
  });

  if (!res.ok) {
    throw new Error("Failed to fetch devices");
  }

  return res.json();
}

import type { SensorReading } from './types';

export async function fetchSensorData(deviceId: string, start: string, end: string): Promise<SensorReading[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  // Convert start and end to GMT+1
  const startGMTPlus1 = new Date(new Date(start).getTime() + 1 * 60 * 60 * 1000).toISOString();
  const endGMTPlus1 = new Date(new Date(end).getTime() + 1 * 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/readings/aggregated_readings/?device__device_id=${deviceId}&start=${startGMTPlus1}&end=${endGMTPlus1}`,
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
      window.location.href = "/login"; // Redirect to login page
    }
    throw new Error("Failed to fetch sensor data");
  }

  return await response.json();
}