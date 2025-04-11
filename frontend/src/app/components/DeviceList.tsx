'use client';

import Link from 'next/link';

const DeviceList = ({ devices }: { devices: any[] }) => {
  if (!Array.isArray(devices)) {
    return <p className="text-gray-500">No devices found.</p>;
  }

  return (
    <div className="grid gap-4">
      {devices.map((device) => (
        <Link
          key={device.device_id}
          href={`/devices/${device.device_id}`}
          className="block p-4 bg-[#f4f4f4] dark:bg-[#1e1e1e] border rounded-lg shadow transition hover:bg-[#e9f5f2] dark:hover:bg-[#264653]"
        >
          <h2 className="font-semibold text-[#264653] dark:text-[#e0e0e0]">ID: {device.device_id}</h2>
          <p className="text-gray-600 dark:text-gray-400">Location: {device.location || 'N/A'}</p>
          <p
            className={`font-semibold ${
              device.status === 'active'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            Status: {device.status}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default DeviceList;
