'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Line } from 'react-chartjs-2';
import { fetchMultiDeviceSensorData, fetchDevices } from '@/lib/api'; // Use the centralized fetchDevices function
import useAuth from '@/hooks/useAuth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ChartPage = () => {
  const router = useRouter(); // Initialize router for navigation
  const isAuthenticated = useAuth(); // Use the useAuth hook for authentication
  const [sensorType, setSensorType] = useState('temperature'); // Default sensor type
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]); // Selected devices
  const [allDevices, setAllDevices] = useState<string[]>([]); // List of all devices
  const [timeRange, setTimeRange] = useState('hour'); // Default time range
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the list of all devices on component mount
  useEffect(() => {
    if (!isAuthenticated) return; // Ensure the user is authenticated before fetching devices

    const fetchAllDevices = async () => {
      try {
        const devices = await fetchDevices(); // Use the centralized function
        const deviceIds = devices.map((device) => device.device_id);
        setAllDevices(deviceIds);
        setSelectedDevices(deviceIds); // Default to all devices
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchAllDevices();
  }, [isAuthenticated]);

  // Fetch chart data whenever sensorType, selectedDevices, or timeRange change
  useEffect(() => {
    if (!isAuthenticated || selectedDevices.length === 0) return; // Ensure the user is authenticated and devices are selected

    const fetchData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        let start: string;

        // Determine the start time based on the selected time range
        switch (timeRange) {
          case 'hour':
            start = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(); // Last hour
            break;
          case '6hours':
            start = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(); // Last 6 hours
            break;
          case 'day':
            start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // Last day
            break;
          case 'week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last week
            break;
          case 'month':
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last month
            break;
          default:
            start = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(); // Default to last hour
        }

        const end = now.toISOString();

        const data = await fetchMultiDeviceSensorData(selectedDevices, sensorType, start, end);

        // Process data for the chart
        const labels = [...new Set(data.map((item) => 
            new Date(item.timestamp).toLocaleString('en-GB', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
          })))]; // Unique timestamps
        
        const datasets = selectedDevices.map((deviceId) => ({
          label: `${deviceId}`,
          data: data
            .filter((item) => item.device_id === deviceId)
            .map((item) => item.avg_value),
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
          fill: false,
        }));

        setChartData({
          labels,
          datasets,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, sensorType, selectedDevices, timeRange]);

  if (!isAuthenticated) return null; // Prevent rendering if the user is not authenticated
  if (loading) return <p className="text-[#264653]">Loading chart...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#f4f4f4] dark:bg-[#1e1e1e] rounded-lg shadow-md">
      {/* Back to Devices Button */}
      <button
        onClick={() => router.push('/')} // Navigate back to the device list
        className="mb-6 px-4 py-2 bg-[#2a9d8f] text-white rounded hover:bg-[#21867a] transition"
      >
        ← Back to Devices
      </button>

      {/* Header */}
      <h1 className="text-3xl font-bold text-[#264653] dark:text-[#e0e0e0] mb-6">
        Sensor Charts
      </h1>

      {/* Dropdowns container */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Dropdown to select devices */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="devices" className="block text-lg font-medium text-[#264653] dark:text-[#e0e0e0]">
            Select Devices:
          </label>
          <select
            id="devices"
            value={selectedDevices.join(',')} // Join device IDs into a single string for the dropdown
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDevices(value === 'all' ? allDevices : [value]); // Set all devices or a single device
            }}
            className="mt-2 p-2 w-full border rounded bg-white dark:bg-[#2a2a2a] text-[#264653] dark:text-[#e0e0e0]"
          >
            <option value="all">All Devices</option>
            {allDevices.map((deviceId) => (
              <option key={deviceId} value={deviceId}>
                {deviceId}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown to select sensor type */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="sensorType" className="block text-lg font-medium text-[#264653] dark:text-[#e0e0e0]">
            Select Sensor Type:
          </label>
          <select
            id="sensorType"
            value={sensorType}
            onChange={(e) => setSensorType(e.target.value)}
            className="mt-2 p-2 w-full border rounded bg-white dark:bg-[#2a2a2a] text-[#264653] dark:text-[#e0e0e0]"
          >
            <option value="temperature">Temperature</option>
            <option value="soil_moisture">Soil Moisture</option>
            <option value="humidity">Humidity</option>
            <option value="air_quality">Air Quality</option>
            <option value="light">Light</option>
          </select>
        </div>

        {/* Dropdown to select time range */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="timeRange" className="block text-lg font-medium text-[#264653] dark:text-[#e0e0e0]">
            Select Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="mt-2 p-2 w-full border rounded bg-white dark:bg-[#2a2a2a] text-[#264653] dark:text-[#e0e0e0]"
          >
            <option value="hour">Last Hour</option>
            <option value="6hours">Last 6 Hours</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      {chartData && <Line data={chartData} />}
    </div>
  );
};

export default ChartPage;