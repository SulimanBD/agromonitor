# api/views.py
from rest_framework import viewsets
from .models import SensorReading
from .serializers import SensorReadingSerializer

class SensorReadingViewSet(viewsets.ModelViewSet):
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer
