FROM python:3.12-slim

# Set working directory
WORKDIR /simulator

# Install system dependencies and Python packages
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Install supervisor to manage both processes
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# Copy the supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Run both scripts
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
