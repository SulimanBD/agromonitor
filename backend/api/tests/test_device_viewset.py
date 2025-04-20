from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Device

class DeviceViewSetTest(APITestCase):

    def setUp(self):
        # Create a sample device
        self.device = Device.objects.create(
            device_id="test_device",
            name="Test Device",
            location="Test Location",
            status="active"
        )

    def test_list_devices(self):
        # Test the list endpoint
        response = self.client.get("/api/devices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["device_id"], "test_device")

    def test_create_device(self):
        # Test the create endpoint
        data = {
            "device_id": "new_device",
            "name": "New Device",
            "location": "New Location",
            "status": "inactive"
        }
        response = self.client.post("/api/devices/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Device.objects.count(), 2)
        self.assertEqual(Device.objects.last().device_id, "new_device")