from decouple import Config, Csv

config = Config()

REDIS_HOST = config("REDIS_HOST", default="localhost")
REDIS_PORT = config("REDIS_PORT", cast=int, default=6379)
REDIS_STREAM = config("REDIS_STREAM", default="sensor_readings")
MQTT_BROKER = config("MQTT_BROKER", default="localhost")
MQTT_PORT = config("MQTT_PORT", cast=int, default=1883)
MQTT_TOPIC = config("MQTT_TOPIC", default="sensors/#")
PUBLISH_INTERVAL = 5  # seconds (constant)
