import os
import paho.mqtt.client as mqtt
import redis
import json
import logging
from time import sleep

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Read configuration from environment variables (cloud-friendly)
mqtt_broker = os.getenv("MQTT_BROKER", "localhost")
mqtt_port = int(os.getenv("MQTT_PORT", 1883))
mqtt_topic = os.getenv("MQTT_TOPIC", "sensors/#")

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))

# Define Redis client globally so it can be accessed across functions
redis_client = None

# MQTT Callback when message is received
def on_message(client, userdata, message):
    try:
        payload = message.payload.decode("utf-8")  # Decode bytes to string
        sensor_data = json.loads(payload)  # Convert to dictionary
        logger.info(f"Received message: {sensor_data}")
        
        # Publish the message to Redis Stream
        if redis_client:
            redis_client.xadd("sensor_stream", sensor_data)
            logger.info(f"Data added to Redis stream: {sensor_data}")
        else:
            logger.error("Redis client is not initialized.")
    except Exception as e:
        logger.error(f"Error processing message: {e}")

# Setup MQTT Client
client = mqtt.Client()
client.on_message = on_message

# Connect to MQTT Broker and handle reconnection
def mqtt_connect():
    while True:
        try:
            logger.info(f"Connecting to MQTT Broker at {mqtt_broker}:{mqtt_port}")
            client.connect(mqtt_broker, mqtt_port, 60)
            client.subscribe(mqtt_topic)
            break  # Break loop if connection is successful
        except Exception as e:
            logger.error(f"Failed to connect to MQTT Broker: {e}")
            sleep(5)  # Wait before retrying

# Setup Redis Client with reconnection
def redis_connect():
    global redis_client
    while True:
        try:
            logger.info(f"Connecting to Redis at {redis_host}:{redis_port}")
            redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
            redis_client.ping()  # Check if Redis is available
            break  # Break loop if connection is successful
        except redis.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            sleep(5)  # Wait before retrying

# Main function to start MQTT loop and Redis connection
def start():
    redis_connect()  # Ensure Redis is connected before MQTT
    mqtt_connect()  # Ensure MQTT is connected before starting the loop
    client.loop_forever()  # Keep the MQTT client listening for messages

if __name__ == "__main__":
    start()
