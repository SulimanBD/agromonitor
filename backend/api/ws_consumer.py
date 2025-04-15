# backend/api/ws_consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SensorReadingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract device_id from the WebSocket URL
        self.device_id = self.scope['url_route']['kwargs']['device_id']
        self.room_group_name = f"sensor_readings_{self.device_id}"

        # Join room group for the specific device
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from Redis or backend logic
    async def send_sensor_data(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps(event))
