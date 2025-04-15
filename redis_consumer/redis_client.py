import redis
from config import REDIS_HOST, REDIS_PORT
from logger_config import get_logger

logger = get_logger(__name__)

def get_redis_connection():
    logger.info("Connecting to Redis...")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        r.ping()
        logger.info("Successfully connected to Redis.")
        return r
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect to Redis", exc_info=True)
        raise
