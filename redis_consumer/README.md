# Redis Consumer

The **Redis Consumer** is a component of the AgroMonitoring system that listens to a Redis stream for sensor data and forwards it to the Django API for storage and processing.

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
Ensure the .env file is configured correctly. Use .env.example as a reference:
```dotenv
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_STREAM=sensor_readings
API_ENDPOINT=http://localhost:8000/api/readings/
```

### 3. Run Redis consumer
Run [Redis to API](./redis_to_api.py).