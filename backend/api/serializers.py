# api/serializers.py
from rest_framework import serializers
from .models import Device, SensorReading

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'
