# AgroMonitoring

AgroMonitoring is a real-time environmental monitoring system designed for agricultural use. It collects data from IoT devices (e.g., temperature, humidity, etc.), processes it through a backend, stores it in a database, and provides a web dashboard for monitoring and insights.

---

## 🚀 Project Setup

This project is structured as a monorepo, containing the following components:

- **simulator/** - Simulated IoT sensor data to publish MQTT and then forward to Redis.
- **redis_consumer/** - A Python service that acts as a bridge between Redis streams and the Django API.
- **backend/** - Django REST API that handles sensor data and serves it to the frontend.
- **frontend/** - React Next.js-based dashboard for visualizing the data.

---

### 🛠 Technologies Used

- **Backend:**
  - Django
  - PostgreSQL (TimescaleDB)

- **Frontend:**
  - React
  - Next.js
  - Tailwind CSS (for styling)
  - Chart.js (for data visualization)

- **IoT:**
  - MQTT (for message brokering)
  - Redis Streams (for real-time data processing)

- **Cloud (Future):**
  - Docker
  - AWS (S3, ECS, Lambda)

---

## 🏗 Getting Started

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/agromonitoring.git
   cd agromonitoring
