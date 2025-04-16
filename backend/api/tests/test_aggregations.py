from datetime import datetime
import pytest
from rest_framework.test import APITestCase
from api.models import Device, SensorReading
from django.utils.timezone import now, timedelta
from django.db import connection

class AggregatedReadingsTest(APITestCase):

    @classmethod
    def setUpTestData(self):

        with connection.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
            # cursor.execute("SELECT create_hypertable('api_sensorreading', 'timestamp');")

        # Create multiple devices
        self.device1 = Device.objects.create(device_id="device_1")
        self.device2 = Device.objects.create(device_id="device_2")

        # Create sensor readings for device 1
        timestamp = datetime.fromisoformat('2025-04-15T12:00:00+00:00')  # Add timezone info for UTC
        SensorReading.objects.create(device=self.device1, timestamp=timestamp, temperature=25.0)
        SensorReading.objects.create(device=self.device1, timestamp=timestamp + timedelta(minutes=5), temperature=26.0)

        # Create sensor readings for device 2
        SensorReading.objects.create(device=self.device2, timestamp=timestamp, temperature=22.0)
        SensorReading.objects.create(device=self.device2, timestamp=timestamp + timedelta(minutes=5), temperature=23.0)


    def test_single_device_aggregation(self):

        response = self.client.get(
            "/api/readings/sngl_dvc_mult_sensor/",
            {"device__device_id": "device_1", "start": "2025-04-15T00:00:00Z", "end": "2025-04-15T23:59:59Z"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue("temperature" in response.data[0])


    def test_multiple_devices_single_sensor_aggregation(self):

        # Define query parameters
        params = {
            "device_ids[]": ["device_1", "device_2"],  # Pass device IDs as a list
            "sensor_type": "temperature",
            "start": "2025-04-15T00:00:00Z",
            "end": "2025-04-15T23:59:59Z",
        }

        # Send GET request to the endpoint
        response = self.client.get("/api/readings/mult_dvcs_sngl_sensor/", params)

        # Assert the response status code
        self.assertEqual(response.status_code, 200)

        # Assert the response data
        self.assertEqual(len(response.data), 2)  # Ensure data for both devices is returned
        self.assertTrue(any(device["device_id"] == "device_1" for device in response.data))
        self.assertTrue(any(device["device_id"] == "device_2" for device in response.data))
        self.assertTrue(all("avg_value" in device for device in response.data))