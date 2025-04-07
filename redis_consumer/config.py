from dotenv import load_dotenv
import os
from redis_consumer.logger_config import get_logger

from config import REDIS_HOST, REDIS_PORT, REDIS_STREAM

logger = get_logger(__name__)
load_dotenv()

API_ENDPOINT = os.getenv("API_ENDPOINT","http://localhost:8000/api/readings/")

