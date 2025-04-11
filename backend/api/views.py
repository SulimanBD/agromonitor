# api/views.py
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import SensorReading, Device
from .serializers import SensorReadingSerializer, DeviceSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils.dateparse import parse_datetime
from rest_framework_simplejwt.views import TokenObtainPairView

class SensorReadingViewSet(viewsets.ModelViewSet):
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['device__device_id']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']  # Default ordering

    def get_queryset(self):
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')

        filters = {}
        if start:
            filters['timestamp__gte'] = parse_datetime(start)
        if end:
            filters['timestamp__lte'] = parse_datetime(end)

        # Filter + join device table in one go
        queryset = SensorReading.objects.select_related('device').filter(**filters)

        return queryset
    
    def perform_create(self, serializer):
        # Save the sensor reading to the DB
        sensor_reading = serializer.save()

        # Send the new sensor reading to WebSocket
        broadcast_to_websocket(sensor_reading)

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    # You can customize the token response here if needed.
    pass

def broadcast_to_websocket(sensor_reading):
    channel_layer = get_channel_layer()
    room_group_name = f"sensor_readings_{sensor_reading.device.device_id}"

    # Dynamically construct the data dictionary based on available sensor readings
    data = {
        "device_id": sensor_reading.device.device_id,
        "timestamp": sensor_reading.timestamp.isoformat(),
    }

    # Add sensor readings dynamically if they are not None
    if sensor_reading.temperature is not None:
        data["temperature"] = sensor_reading.temperature
    if sensor_reading.humidity is not None:
        data["humidity"] = sensor_reading.humidity
    if sensor_reading.light is not None:
        data["light"] = sensor_reading.light
    if sensor_reading.air_quality is not None:
        data["air_quality"] = sensor_reading.air_quality
    if sensor_reading.soil_moisture is not None:
        data["soil_moisture"] = sensor_reading.soil_moisture

    # Broadcast the data to the WebSocket room group
    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            "type": "send_sensor_data",
            "data": data,
        }
    )