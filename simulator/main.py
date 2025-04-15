import time
import json
from datetime import datetime
from devices import MICROCONTROLLER_HUBS, initialize_readings
from sensors import update_sensor
from mqtt_client import connect_mqtt, publish
from config import PUBLISH_INTERVAL

last_readings = initialize_readings()
client = connect_mqtt()

print("Realistic MQTT simulator started...")

while True:
    for hub in MICROCONTROLLER_HUBS:
        hub_id = hub["hub_id"]
        payload = {
            "device_id": hub_id,
            "timestamp": datetime.now().isoformat()
        }

        for sensor in hub["sensors"]:
            prev_value = last_readings[hub_id][sensor]
            new_value = update_sensor(sensor, prev_value)
            last_readings[hub_id][sensor] = new_value
            payload[sensor] = new_value

        topic = f"sensors/{hub_id}/data"
        message = json.dumps(payload)
        publish(client, topic, message)
        print(f"Published to {topic}: {message}")

    time.sleep(PUBLISH_INTERVAL)