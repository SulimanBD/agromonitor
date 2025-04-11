import random

SENSOR_SETTINGS = {
    "temperature": {"min": 15.0, "max": 40.0, "delta": 0.2},  # Smaller delta for gradual changes
    "humidity": {"min": 20.0, "max": 90.0, "delta": 0.5},    # Gradual changes for humidity
    "light": {"min": 100, "max": 1000, "delta": 20},         # Larger delta for light, as it can vary quickly
    "air_quality": {"min": 0.0, "max": 1.0, "delta": 0.01},  # Very small changes for air quality
    "soil_moisture": {"min": 10.0, "max": 100.0, "delta": 0.5},  # Gradual changes for soil moisture
}

def update_sensor(sensor, prev_value):
    settings = SENSOR_SETTINGS[sensor]
    delta = random.uniform(-settings["delta"], settings["delta"])  # Random change within delta
    new_value = prev_value + delta

    # Clamp the value to ensure it stays within the min and max range
    clamped = max(settings["min"], min(settings["max"], new_value))

    # Add smoothing logic for more realistic changes
    if sensor == "temperature":
        clamped = round(clamped, 1)  # Temperature changes in tenths
    elif sensor == "humidity" or sensor == "soil_moisture":
        clamped = round(clamped, 1)  # Humidity and soil moisture changes in tenths
    elif sensor == "light":
        clamped = int(clamped)  # Light changes in whole numbers
    elif sensor == "air_quality":
        clamped = round(clamped, 2)  # Air quality changes in hundredths

    return clamped
