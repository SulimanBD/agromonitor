# api/serializers.py
import logging
from rest_framework import serializers
from .models import Device, SensorReading

# Set up the logger
logger = logging.getLogger(__name__)

class SensorReadingSerializer(serializers.ModelSerializer):
    device_id = serializers.CharField(write_only=True)

    class Meta:
        model = SensorReading
        fields = ['device_id', 'timestamp', 'temperature', 'humidity', 'light', 'air_quality', 'soil_moisture']

    def create(self, validated_data):
        device_id = validated_data.pop('device_id')

        # Try to get the device, or create it if it doesn't exist
        device, created = Device.objects.get_or_create(device_id=device_id)

        if created:
            # Optionally log that a new device has been created
            logger.info(f"Device with ID '{device_id}' created.")

        return SensorReading.objects.create(device=device, **validated_data)
