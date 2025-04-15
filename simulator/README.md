# Simulator

The **Simulator** generates realistic IoT sensor data, publishes it to an MQTT broker, and forwards it to a Redis stream.

---

## 🚀 How to Run

### 1. Install Dependencies

Set up a Python virtual environment and install the required dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Define ENV vars
Ensure the environment variable are set to connect to MQTT and Redis:

```dotenv
MQTT_BROKER=localhost
MQTT_PORT=1883
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_STREAM=sensor_readings
PUBLISH_INTERVAL=5
```

### 3. Run simulator

Run [main](./main.py) to simulate sensor data publishing into MQTT.
Run [MQTT to Redis](./mqtt_to_redis.py) to publish the MQTT message into Redis streams.
