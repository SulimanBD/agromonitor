import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT

def connect_mqtt():
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT)
    return client


def publish(client, topic, message):
    client.publish(topic, message)