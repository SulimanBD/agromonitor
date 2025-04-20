// __tests__/api.test.ts
import { fetchDevices, fetchMultiDeviceSensorData, fetchSingleDeviceData } from '@/lib/api';

global.fetch = jest.fn();


describe('API Calls', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls
    localStorage.setItem("access_token", "fake-jwt-token");
  });


  // Testing fetchDevices()

  test('should fetch devices successfully', async () => {
    const mockDevicesResponse = {
      results: [{ device_id: 'Greenhouse_123', name: '', location: '', status: 'active' }],
    };

    // Mocking fetch to return a successful response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDevicesResponse,
    });

    const devices = await fetchDevices();
    expect(devices).toEqual(mockDevicesResponse.results);
  });

  test('should throw error if token is not found', async () => {
    // Remove token from localStorage
    localStorage.removeItem('access_token');

    await expect(fetchDevices()).rejects.toThrow('No authentication token found');
  });

  test('should handle unauthorized response', async () => {
    // Mock fetch to return 401 Unauthorized
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });
  
    // Mock window.location.assign
    const assignMock = jest.fn();
    delete (window as any).location; // Remove default location to avoid readonly errors
    (window as any).location = { assign: assignMock };
  
    await fetchDevices();
  
    expect(assignMock).toHaveBeenCalledWith('/login');
  });

  test('should handle failed response', async () => {
    // Mock fetch to return a failed response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(fetchDevices()).rejects.toThrow('Failed to fetch devices');
  });


  // Testing fetchSingleDeviceData()

  test('should fetch sensor data for a single device', async () => {
      const mockSensorData = [{ 
          timestamp: '2025-04-16T09:00:00Z', 
          device_id: 'greenhub_123', 
          temperature: 25, 
          humidity: 60,
          air_quality: 0.6}];
      const deviceId = 'greenhub_123';
      const start = '2025-04-16T08:00:00Z';
      const end = '2025-04-16T10:00:00Z';
    
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSensorData,
      });
    
      const data = await fetchSingleDeviceData(deviceId, start, end);
      expect(data).toEqual(mockSensorData);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings/sngl_dvc_mult_sensor/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });
  
  test('should throw error when token is not found in fetchSingleDeviceData', async () => {
    localStorage.removeItem('access_token');
  
    await expect(fetchSingleDeviceData('greenhub_123', '2025-04-16T08:00:00Z', '2025-04-16T10:00:00Z')).rejects.toThrow(
      'No authentication token found'
    );
  });


  // Testing fetchMultiDeviceSensorData()

  test('should fetch multi-device sensor data', async () => {
      const mockMultiDeviceData = [
        { timestamp: '2025-04-16T09:00:00Z', device_id: 'ard_123', avg_value: 25 },
        { timestamp: '2025-04-16T09:00:00Z', device_id: 'ard_456', avg_value: 30 },
      ];
      const deviceIds = ['ard_123', 'ard_456'];
      const sensorType = 'temperature';
      const start = '2025-04-16T08:00:00Z'; 
      const end = '2025-04-16T10:00:00Z';
    
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMultiDeviceData,
      });
    
      const data = await fetchMultiDeviceSensorData(deviceIds, sensorType, start, end);
      expect(data).toEqual(mockMultiDeviceData);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings/mult_dvcs_sngl_sensor/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });

});