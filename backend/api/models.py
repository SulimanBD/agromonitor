# api/models.py
from django.db import models

class Device(models.Model):
    device_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=50, default='active')

    def __str__(self):
        return f"{self.name or self.device_id} ({self.status})"

    @classmethod
    def get_or_create_device(cls, device_id, name, location, status):
        """
        Get a device by ID. If it doesn't exist, create it.
        If it exists, update the fields: name, location, status.
        """
        device, created = cls.objects.get_or_create(device_id=device_id)
        
        # If the device was found, update its details
        if not created:
            device.name = name
            device.location = location
            device.status = status
            device.save()
        
        return device


class SensorReading(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, db_index=True)  # Ensure indexed
    timestamp = models.DateTimeField(db_index=True)  # Index for range filtering

    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    light = models.IntegerField(null=True, blank=True)
    air_quality = models.FloatField(null=True, blank=True)
    soil_moisture = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['device', 'timestamp']),
        ]
