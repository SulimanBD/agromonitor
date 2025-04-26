import time
import requests
from redis_client import get_redis_connection
from config import REDIS_STREAM, API_ENDPOINT
from logger_config import get_logger

logger = get_logger(__name__)

# Define a key for storing the last processed message ID
LAST_ID_KEY = "last_processed_id"

def get_last_id(redis_conn):
    """Fetch the last processed ID from Redis."""
    last_id = redis_conn.get(LAST_ID_KEY)
    return last_id if last_id else "0"  # Default to "0" if not found

def save_last_id(redis_conn, last_id):
    """Save the last processed ID to Redis."""
    redis_conn.set(LAST_ID_KEY, last_id)

def forward_to_django(payload):
    """Send the sensor data to Django API."""
    try:
        response = requests.post(API_ENDPOINT, json=payload)
        if response.status_code == 201:
            logger.info(f"Data sent to Django API successfully: {payload}")
        else:
            logger.warning(f"Failed to post to Django API. Status: {response.status_code}, Payload: {payload}")
    except Exception as e:
        logger.error("Error posting to Django API", exc_info=True)

def wait_for_backend():
    """Wait until the backend is available."""
    while True:
        try:
            response = requests.get(API_ENDPOINT)
            if response.status_code == 200:
                logger.info("Backend is available!")
                break
        except requests.exceptions.ConnectionError:
            logger.warning("Backend not available, retrying in 5 seconds...")
            time.sleep(5)

def consume_stream():
    redis_conn = get_redis_connection()
    logger.info(f"Listening to Redis stream: {REDIS_STREAM}")

    # Wait for backend to be available
    wait_for_backend()

    # Retrieve last processed ID from Redis
    last_id = get_last_id(redis_conn)

    while True:
        try:
            # Reading from the Redis stream
            messages = redis_conn.xread({REDIS_STREAM: last_id}, block=1000, count=10)
            if messages:
                for stream, entries in messages:
                    for message_id, data in entries:
                        logger.debug(f"New message [{message_id}]: {data}")

                        # Decode Redis stream data
                        decoded_data = {
                            k: float(v) if k in ['temperature', 'humidity', 'soil_moisture', 'air_quality']
                            else int(v) if k == 'light'
                            else v 
                            for k, v in data.items()
                        }

                        forward_to_django(decoded_data)

                        # Update last_id in Redis after processing each message
                        last_id = message_id
                        save_last_id(redis_conn, last_id)

        except Exception:
            logger.error("Unexpected error during stream consumption", exc_info=True)
            time.sleep(2)  # slight delay before retrying

if __name__ == "__main__":
    consume_stream()