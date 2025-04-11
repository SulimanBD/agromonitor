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
