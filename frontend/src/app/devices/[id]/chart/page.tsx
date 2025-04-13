'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { fetchSensorData } from '@/lib/api';
import { Line } from 'react-chartjs-2';
import useAuth from '@/hooks/useAuth';

// Import Chart.js components
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
import { SensorReading } from '@/lib/types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ChartPage = () => {
  const isAuthenticated = useAuth(); // Ensure authentication
  const params = useParams(); // Get the device ID from params
  const router = useRouter(); // Initialize the router
  const [chartData, setChartData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('hour'); // Default time range

  useEffect(() => {
    if (!isAuthenticated) return; // Prevent fetching data if not authenticated

    const fetchData = async () => {
      try {
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
        const data = await fetchSensorData(params.id as string, start, end);

        if (data.length === 0) {
          console.warn('No data available for the selected time range.');
          setChartData({});
          setLoading(false);
          return;
        }

        // Prepare data for each sensor
        const sensors: Array<keyof SensorReading> = ['temperature', 'humidity', 'air_quality', 'light', 'soil_moisture'];
        const sensorUnits: Record<string, string> = {
          temperature: '°C',
          humidity: '%',
          air_quality: 'AQI',
          light: 'lx',
          soil_moisture: '%',
        };
        const newChartData: Record<string, any> = {};

        sensors.forEach((sensor) => {
          const sensorData = data.map((reading: SensorReading) => reading[sensor]);
          const labels = data.map((reading) => {
            const date = new Date(reading.timestamp);
            return date.toLocaleString('en-GB', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false, // Use 24-hour format
            });
          });

          // Only include the chart if there is valid data for the sensor
          if (sensorData.some((value) => value !== null && value !== undefined)) {
            newChartData[sensor] = {
              labels,
              datasets: [
                {
                  label: `${sensor.replace('_', ' ').toUpperCase()} (${sensorUnits[sensor] || ''})`, // Add unit to the label
                  data: sensorData,
                  borderColor: getSensorColor(sensor),
                  backgroundColor: getSensorBackgroundColor(sensor),
                  fill: true,
                  tension: 0.4, // Optional: Add smooth curves to the chart
                },
              ],
              options: {
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context: { raw: number }) {
                        const value = context.raw; // Get the raw value
                        const unit = sensorUnits[sensor] || ''; // Get the unit for the sensor
    return `${value} ${unit}`; // Append the unit to the value
                      },
                    },
                  },
                },
              },
            };
          }
        });

        setChartData(newChartData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, [timeRange, params?.id, isAuthenticated]);

  if (!isAuthenticated) return null; // Prevent rendering if not authenticated

  if (loading) return <p>Loading charts...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#f4f4f4] dark:bg-[#1e1e1e] rounded-lg shadow-md">
{/* Header with Device ID */}
      <h1 className="text-3xl font-bold text-[#264653] dark:text-[#e0e0e0] mb-6">
      Charts for {params?.id}
      </h1>

      {/* Flex container for the buttons and time range selector */}
      <div className="flex items-center justify-between mb-4">
        {/* Back to Real Time Readings Button */}
        <button
          onClick={() => router.push(`/devices/${params?.id}`)} // Navigate back to the device page
          className="px-4 py-2 bg-[#2a9d8f] text-white rounded hover:bg-[#21867a] transition"
        >
          Back to Real Time
        </button>

        {/* Back to Device List Button */}
        <button
          onClick={() => router.push(`/`)} // Navigate back to the device list
          className="px-4 py-2 bg-[#e76f51] text-white rounded hover:bg-[#d65a41] transition mx-4"
        >
          Back to Device List
        </button>

        {/* Time Range Selector */}
        <div>
          <label htmlFor="timeRange" className="block text-lg font-medium text-[#264653] dark:text-[#e0e0e0]">
            Select Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="mt-2 p-2 border rounded bg-white dark:bg-[#2a2a2a] text-[#264653] dark:text-[#e0e0e0]"
          >
            <option value="hour">Last Hour</option>
            <option value="6hours">Last 6 Hours</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Render Charts */}
      {Object.keys(chartData).length > 0 ? (
        Object.entries(chartData).map(([sensor, data]) => (
          <div key={sensor} className="mb-8">
            <h2 className="text-2xl font-bold text-[#264653] dark:text-[#e0e0e0] mb-4">
              {sensor.replace('_', ' ').toUpperCase()}
            </h2>
            <Line data={data} />
          </div>
        ))
      ) : (
        <p>No data available for the selected time range.</p>
      )}
    </div>
  );
};

// Helper functions to get colors for each sensor
const getSensorColor = (sensor: string) => {
  const colors: Record<string, string> = {
    temperature: '#2a9d8f',
    humidity: '#264653',
    air_quality: '#e76f51',
    light: '#f4a261',
    soil_moisture: '#e9c46a',
  };
  return colors[sensor] || '#000000'; // Default to black if no color is defined
};

const getSensorBackgroundColor = (sensor: string) => {
  const colors: Record<string, string> = {
    temperature: 'rgba(42, 157, 143, 0.2)',
    humidity: 'rgba(38, 70, 83, 0.2)',
    air_quality: 'rgba(231, 111, 81, 0.2)',
    light: 'rgba(244, 162, 97, 0.2)',
    soil_moisture: 'rgba(233, 196, 106, 0.2)',
  };
  return colors[sensor] || 'rgba(0, 0, 0, 0.2)'; // Default to black if no color is defined
};

export default ChartPage;