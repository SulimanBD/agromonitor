from datetime import datetime
from django.test import TestCase
from api.models import Device, SensorReading
from django.db import models


class DeviceModelTest(TestCase):

    def setUp(self):
        self.device = Device.objects.create(
            device_id="test_device",
            name="Test Device",
            location="Test Location",
            status="active"
        )

    def test_device_creation(self):
        self.assertEqual(self.device.device_id, "test_device")
        self.assertEqual(self.device.name, "Test Device")
        self.assertEqual(self.device.location, "Test Location")
        self.assertEqual(self.device.status, "active")


class SensorReadingModelTest(TestCase):

    def setUp(self):
        self.device = Device.objects.create(device_id="test_device")

    def test_sensor_reading_creation(self):
        reading = SensorReading.objects.create(
            device=self.device,
            timestamp="2025-04-15T12:00:00Z",
            temperature=25.5,
            humidity=60.0,
            light=300,
            air_quality=0.05,
            soil_moisture=20.0
        )

        self.assertEqual(reading.device.device_id, "test_device")
        self.assertEqual(reading.temperature, 25.5)
        self.assertEqual(reading.light, 300)
        self.assertEqual(reading.air_quality, 0.05)