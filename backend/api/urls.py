# api/urls.py
from rest_framework.routers import DefaultRouter
from .views import SensorReadingViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'readings', SensorReadingViewSet)

urlpatterns = router.urls