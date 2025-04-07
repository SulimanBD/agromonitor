# api/admin.py
from django.contrib import admin
from .models import Device, SensorReading

admin.site.register(Device)
admin.site.register(SensorReading)
