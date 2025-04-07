# redis_consumer/api_client.py

import requests
from config import DJANGO_API_URL

def push_to_django(payload):
    try:
        response = requests.post(DJANGO_API_URL, json=payload)
        response.raise_for_status()
        print(f"✅ Sent to Django: {payload}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to send data: {e}")
