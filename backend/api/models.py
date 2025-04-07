# api/models.py
from django.db import models

class Device(models.Model):
    device_id = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=100, blank=True)

class SensorReading(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    light = models.IntegerField(null=True, blank=True)
    air_quality = models.FloatField(null=True, blank=True)
    soil_moisture = models.FloatField(null=True, blank=True)
