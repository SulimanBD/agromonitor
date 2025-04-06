import paho.mqtt.client as mqtt
from config import BROKER, PORT

def connect_mqtt():
    client = mqtt.Client()
    client.connect(BROKER, PORT)
    return client


def publish(client, topic, message):
    client.publish(topic, message)