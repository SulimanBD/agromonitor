'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import DeviceList from './components/DeviceList';
import { fetchDevices } from '@/lib/api'; // Import the centralized fetchDevices function
import { Device } from '@/lib/types';

const DevicesPage = () => {
  const isAuthenticated = useAuth(); // Centralized authentication
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAllDevices = async () => {
      try {
        const devices = await fetchDevices(); // Use the centralized function
        setDevices(devices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchAllDevices();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (loading) return <p className="text-[#264653]">Loading...</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto bg-[#f4f4f4] dark:bg-[#1e1e1e] rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-[#264653] dark:text-[#e0e0e0] mb-6">Your Devices</h1>
      <DeviceList devices={devices} />
    </main>
  );
};

export default DevicesPage;
