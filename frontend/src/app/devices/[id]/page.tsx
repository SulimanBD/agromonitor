// src/app/devices/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

const DevicePage = () => {
  const isAuthenticated = useAuth(); // Centralized authentication
  const [sensorData, setSensorData] = useState(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [deviceIdFromData, setDeviceIdFromData] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true); // Track WebSocket connection state
  const params = useParams();
  const router = useRouter();

  // Map of sensor types to their corresponding units
  const sensorUnits: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    light: 'lux',
    air_quality: 'ppm',
    soil_moisture: '%',
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      socket = new WebSocket(`ws://localhost:8000/ws/sensor_readings/${params?.id}/`);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'send_sensor_data') {
          const { device_id, timestamp, ...sensorValues } = message.data;
          setDeviceIdFromData(device_id);
          setSensorData(sensorValues);
          setTimestamp(timestamp);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after a delay
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket?.close();
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, [isAuthenticated, params?.id]);

  const renderSensorData = (data: Record<string, number | string | null | undefined>) => {
    if (!data || typeof data !== 'object') {
      return <p className="text-gray-500">No sensor data available.</p>;
    }

    return Object.keys(data).map((sensor, index) => {
      const value = data[sensor];
      const unit = sensorUnits[sensor] || ''; // Get the unit for the sensor, or default to an empty string

      return (
        <div
          key={index}
          className="bg-[#f4f4f4] dark:bg-[#1e1e1e] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold text-[#264653] dark:text-[#e0e0e0]">
            {sensor.replace('_', ' ').toUpperCase()}
          </h2>
          <div className="mt-2">
            {typeof value === 'object' && !Array.isArray(value) ? (
              <pre className="bg-[#e8f1f1] dark:bg-[#2a2a2a] p-2 rounded text-sm text-[#264653] dark:text-[#e0e0e0]">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : Array.isArray(value) ? (
              <ul className="list-disc pl-4 text-[#264653] dark:text-[#e0e0e0]">
                {value.map((item, i) => (
                  <li key={i}>{item || 'N/A'}</li>
                ))}
              </ul>
            ) : (
              <h3 className="text-2xl text-[#2a9d8f] font-bold">
                {value} {unit}
              </h3>
            )}
          </div>
        </div>
      );
    });
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '...';
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('en-GB', { hour12: false });
    const timezone = date.toLocaleTimeString('en-GB', { timeZoneName: 'short' }).split(' ')[1];
    return `${time} ${timezone}`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#f4f4f4] dark:bg-[#1e1e1e] rounded-lg shadow-md">
      {/* Flex container for the buttons */}
      <div className="flex items-center justify-between mb-6">
        {/* Back to Devices Button */}
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-[#2a9d8f] text-white rounded hover:bg-teal-600 transition-colors"
        >
          ← Back to Devices List
        </button>

        {/* View Historical Data Button */}
        <button
          onClick={() => router.push(`/devices/${params?.id}/chart`)}
          className="px-4 py-2 bg-[#4a90e2] text-white rounded hover:bg-[#357ab8] transition-colors"
        >
          View Historical Data →
        </button>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold text-[#264653] dark:text-[#e0e0e0] mb-6">
        Device: {deviceIdFromData || '...'}
      </h1>

      {/* Last Updated */}
      <p className="text-lg text-[#8d6e63] dark:text-[#a8a8a8] mb-6">
        Last Updated: <span className="font-mono text-xl text-[#2a9d8f]">{formatTimestamp(timestamp || '')}</span>
      </p>

      {/* Connection Status */}
      {!isConnected && (
        <p className="text-red-500 font-semibold mb-4">Reconnecting to the server...</p>
      )}

      {/* Sensor Data */}
      {sensorData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {renderSensorData(sensorData)}
        </div>
      ) : (
        <p className="text-[#264653] dark:text-[#e0e0e0]">No new data coming in...</p>
      )}
    </div>
  );
};

export default DevicePage;
