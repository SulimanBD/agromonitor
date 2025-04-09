from decouple import config
from logger_config import get_logger

logger = get_logger(__name__)

REDIS_HOST = config("REDIS_HOST", default="localhost")
REDIS_PORT = config("REDIS_PORT", default=6379, cast=int)
REDIS_STREAM = config("REDIS_STREAM", default="sensor_readings")
API_ENDPOINT = config("API_ENDPOINT", default="http://localhost:8000/api/readings/")
