import paho.mqtt.client as mqtt
import redis
import json
import logging
from time import sleep

from config import REDIS_HOST, REDIS_PORT, MQTT_BROKER, MQTT_PORT, MQTT_TOPIC

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
            redis_client.xadd("sensor_readings", sensor_data)
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
            logger.info(f"Connecting to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}")
            client.connect(MQTT_BROKER, MQTT_PORT, 60)
            client.subscribe(MQTT_TOPIC)
            break  # Break loop if connection is successful
        except Exception as e:
            logger.error(f"Failed to connect to MQTT Broker: {e}")
            sleep(5)  # Wait before retrying

# Setup Redis Client with reconnection
def redis_connect():
    global redis_client
    while True:
        try:
            logger.info(f"Connecting to Redis at {REDIS_HOST}:{REDIS_PORT}")
            redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
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
