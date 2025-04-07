import os
from dotenv import load_dotenv
from config import REDIS_HOST, REDIS_PORT, REDIS_STREAM

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "sensors/#")
PUBLISH_INTERVAL = 5  # seconds