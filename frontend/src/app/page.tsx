'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import DeviceList from './components/DeviceList';

const DevicesPage = () => {
  const isAuthenticated = useAuth(); // Centralized authentication
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/api/devices/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          // Handle unauthorized response
          localStorage.removeItem('access_token');
          window.location.href = '/login'; // Redirect to login page
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setDevices(data.results);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching devices:', err);
      });
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
