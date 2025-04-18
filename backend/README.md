# Backend

The **Backend** is a Django-based REST API that handles sensor data, manages devices, and serves data to the frontend. It also supports WebSocket connections using **Daphne** for real-time updates.

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

Setup the details for DB and Redis:
```env
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Run the Django backend

Start the server using Daphne to enable WebSocket support:
```python
daphne -p 8000 config.asgi:application
```