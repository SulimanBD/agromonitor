# config/routing.py
from django.urls import re_path
from . import ws_consumer

websocket_urlpatterns = [
    re_path(r'ws/sensor_readings/(?P<device_id>[^/]+)/$', ws_consumer.SensorReadingConsumer.as_asgi()),
]
