# backend/config/asgi.py
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns
from decouple import config
from django.core.asgi import get_asgi_application
import django

# Using python-decouple to load the DJANGO_SETTINGS_MODULE from environment variables
django_settings_module = config("DJANGO_SETTINGS_MODULE", default="myproject.settings")
django.setup()  # Ensure that Django is set up before using any Django-specific features

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # for Django HTTP views
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
