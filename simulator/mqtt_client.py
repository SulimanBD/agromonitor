import time
import logging
from paho.mqtt import client as mqtt_client
from config import MQTT_BROKER, MQTT_PORT

logger = logging.getLogger(__name__)

def connect_mqtt():
    client = mqtt_client.Client()

    while True:
        try:
            logger.info(f"Connecting to MQTT at {MQTT_BROKER}:{MQTT_PORT}")
            client.connect(MQTT_BROKER, MQTT_PORT)
            logger.info("Connected to MQTT Broker")
            return client
        except Exception as e:
            logger.error(f"MQTT connection failed: {e}")
            time.sleep(5)


def publish(client, topic, message):
    client.publish(topic, message)