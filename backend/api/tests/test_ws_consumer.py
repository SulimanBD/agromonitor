from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from django.test import TransactionTestCase, override_settings
from asgiref.sync import async_to_sync
from config.asgi import application

@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }
)
class SensorReadingConsumerTest(TransactionTestCase):
    def test_sensor_reading_consumer(self):
        async def inner():
            communicator = WebsocketCommunicator(application, "/ws/sensor_readings/test-device/")
            connected, _ = await communicator.connect()
            assert connected

            # Simulate sending data to the WebSocket
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "sensor_readings_test-device",
                {
                    "type": "send_sensor_data",
                    "data": {"temperature": 22.5, "humidity": 60}
                }
            )

            response = await communicator.receive_json_from()
            assert response["data"]["temperature"] == 22.5
            assert response["data"]["humidity"] == 60

            await communicator.disconnect()

        async_to_sync(inner)()
