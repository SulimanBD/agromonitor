# api/views.py
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import SensorReading, Device
from .serializers import SensorReadingSerializer, DeviceSerializer

class SensorReadingViewSet(viewsets.ModelViewSet):
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['device__device_id']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']  # Default ordering

    def get_queryset(self):
        queryset = super().get_queryset()
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')

        if start:
            queryset = queryset.filter(timestamp__gte=parse_datetime(start))
        if end:
            queryset = queryset.filter(timestamp__lte=parse_datetime(end))

        return queryset

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer