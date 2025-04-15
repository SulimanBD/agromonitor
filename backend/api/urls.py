# api/urls.py
from rest_framework.routers import DefaultRouter
from .views import SensorReadingViewSet, DeviceViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'readings', SensorReadingViewSet)
router.register(r'devices', DeviceViewSet)

urlpatterns = router.urls