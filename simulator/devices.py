import random
from sensors import SENSOR_SETTINGS

MICROCONTROLLER_HUBS = [
    {"hub_id": "greenhouse_hub_1", "sensors": ["temperature", "humidity", "light", "air_quality", "soil_moisture"]},
    {"hub_id": "garden_hub_2", "sensors": ["temperature", "humidity", "light", "soil_moisture"]},
    {"hub_id": "indoor_hub_3", "sensors": ["temperature", "humidity", "air_quality"]},
]

def initialize_readings():
    last_readings = {}
    for hub in MICROCONTROLLER_HUBS:
        hub_id = hub["hub_id"]
        last_readings[hub_id] = {}
        for sensor in hub["sensors"]:
            settings = SENSOR_SETTINGS[sensor]
            initial = random.uniform(settings["min"], settings["max"])
            last_readings[hub_id][sensor] = round(initial, 2)
    return last_readings