import random

SENSOR_SETTINGS = {
    "temperature": {"min": 15.0, "max": 40.0, "delta": 0.5},
    "humidity": {"min": 20.0, "max": 90.0, "delta": 1.0},
    "light": {"min": 100, "max": 1000, "delta": 50},
    "air_quality": {"min": 0.0, "max": 1.0, "delta": 0.05},
    "soil_moisture": {"min": 10.0, "max": 100.0, "delta": 2.0},
}

def update_sensor(sensor, prev_value):
    settings = SENSOR_SETTINGS[sensor]
    delta = random.uniform(-settings["delta"], settings["delta"])
    new_value = prev_value + delta
    clamped = max(settings["min"], min(settings["max"], new_value))
    if isinstance(settings["min"], int):
        return int(clamped)
    return round(clamped, 2)
