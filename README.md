# AgroMonitoring

AgroMonitoring is a real-time environmental monitoring system designed for agricultural use. It collects data from IoT devices (e.g., temperature, humidity, etc.), processes it through a backend, stores it in a database, and provides a web dashboard for monitoring and insights.

---

## 🚀 Project Setup

This project is structured as a monorepo, containing the following components:

- **backend/** - Django REST API that handles sensor data and serves it to the frontend.
- **frontend/** - React-based dashboard for visualizing the data.
- **simulator/** - Simulated IoT sensor data to test the system.
- **redis_bridge/** - A Python service that acts as a bridge between MQTT and Redis streams.

---

### 🛠 Technologies Used

- **Backend:**
  - Django
  - Django REST Framework (DRF)
  - PostgreSQL
  - Docker (for containerization)

- **Frontend:**
  - React
  - Chart.js / Recharts / Nivo (for data visualization)

- **IoT:**
  - MQTT (for message brokering)
  - Redis Streams (for real-time data processing)

- **Cloud (Future):**
  - AWS (S3, ECS, Lambda)

---

## 🏗 Getting Started

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/agromonitoring.git
   cd agromonitoring
