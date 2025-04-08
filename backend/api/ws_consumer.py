# backend/api/ws_consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SensorReadingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Called when the WebSocket is handshaking as part of the connection process
        self.room_group_name = "sensor_readings"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Called when the WebSocket closes for any reason
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (if needed, for interaction)
    async def receive(self, text_data):
        pass  # You can implement any interaction logic here (if needed)

    # Receive message from Redis (or from your backend logic)
    async def send_sensor_data(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps(event))
