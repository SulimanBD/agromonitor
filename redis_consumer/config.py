from dotenv import load_dotenv
import os
from logger_config import get_logger

logger = get_logger(__name__)
load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_STREAM = os.getenv("REDIS_STREAM", "sensor_readings")
API_ENDPOINT = os.getenv("API_ENDPOINT","http://localhost:8000/api/readings/")
