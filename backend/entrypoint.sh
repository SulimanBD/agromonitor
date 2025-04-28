#!/bin/bash
# entrypoint.sh

# Wait for PostgreSQL to become available (you can use a tool like "nc" for this)
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  sleep 1
done

echo "PostgreSQL is up! Running migrations..."
python manage.py migrate --noinput

echo "Starting Django..."
exec "$@"