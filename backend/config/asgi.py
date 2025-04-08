# backend/config/asgi.py
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns
from dotenv import load_dotenv
from django.core.asgi import get_asgi_application
import django

load_dotenv()  # To load DJANGO_SETTINGS_MODULE

django.setup() # Ensure that Django is set up before using any Django-specific features

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # for Django HTTP views
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
