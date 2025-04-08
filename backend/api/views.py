# api/views.py
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import SensorReading, Device
from .serializers import SensorReadingSerializer, DeviceSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils.dateparse import parse_datetime

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
        self.broadcast_to_websocket(sensor_reading)

    def broadcast_to_websocket(self, sensor_reading):
        # Send the sensor reading data to WebSocket
        # Send to WebSocket group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "sensor_readings",
            {
                "type": "send_sensor_data",
                "data": self.get_serializer(sensor_reading).data,
            }
        )

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer