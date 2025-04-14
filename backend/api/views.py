# api/views.py
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import SensorReading, Device
from .serializers import SensorReadingSerializer, DeviceSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils.dateparse import parse_datetime
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import connection
from rest_framework.response import Response
from rest_framework.decorators import action

class SensorReadingViewSet(viewsets.ModelViewSet):
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer
    filter_backends = []  # Disable filtering and ordering globally for this view

    @action(detail=False, methods=['get'])
    def sngl_dvc_mult_sensor(self, request):
        """
        Fetch aggregated multi sensor readings for a single device.
        """
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        device_id = request.query_params.get('device__device_id')
        max_points = 50

        # Validate input
        if not start or not end or not device_id:
            return Response({"error": "Missing required parameters: start, end, or device__device_id"}, status=400)

        # Parse and calculate bucket size
        start_time = parse_datetime(start)
        end_time = parse_datetime(end)

        if not start_time or not end_time:
            return Response({"error": "Invalid start or end time format"}, status=400)

        total_seconds = (end_time - start_time).total_seconds()
        bucket_size_seconds = max(total_seconds // max_points, 1)
        bucket_size = f"{int(bucket_size_seconds)} seconds"

        # Execute raw SQL
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT
                    time_bucket(%s, timestamp) AS bucket,
                    AVG(temperature) AS avg_temperature,
                    AVG(humidity) AS avg_humidity,
                    AVG(light) AS avg_light,
                    AVG(air_quality) AS avg_air_quality,
                    AVG(soil_moisture) AS avg_soil_moisture
                FROM api_sensorreading
                WHERE device_id = %s AND timestamp >= %s AND timestamp <= %s
                GROUP BY bucket
                ORDER BY bucket ASC
            """, [bucket_size, device_id, start_time, end_time])

            results = cursor.fetchall()

        # Format the results
        data = [
            {
                "timestamp": row[0],
                "temperature": row[1],
                "humidity": row[2],
                "light": row[3],
                "air_quality": row[4],
                "soil_moisture": row[5],
            }
            for row in results
        ]
        return Response(data)

    @action(detail=False, methods=['get'])
    def mult_dvcs_sngl_sensor(self, request):
        """
        Fetch aggregated readings for multiple devices and a specific sensor type.
        """
        device_ids = request.query_params.getlist('device_ids[]')  # List of device IDs
        sensor_type = request.query_params.get('sensor_type')  # Sensor type (e.g., temperature)
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        max_points = 50

        # Validate input
        if not device_ids or not sensor_type or not start or not end:
            return Response({"error": "Missing required parameters: device_ids, sensor_type, start, or end"}, status=400)

        # Parse and calculate bucket size
        start_time = parse_datetime(start)
        end_time = parse_datetime(end)

        if not start_time or not end_time:
            return Response({"error": "Invalid start or end time format"}, status=400)

        total_seconds = (end_time - start_time).total_seconds()
        bucket_size_seconds = max(total_seconds // max_points, 1)
        bucket_size = f"{int(bucket_size_seconds)} seconds"

        # Execute optimized SQL query
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT
                    time_bucket(%s, timestamp) AS bucket,
                    device_id,
                    AVG({sensor_type}) AS avg_value
                FROM api_sensorreading
                WHERE device_id = ANY(%s) AND timestamp >= %s AND timestamp <= %s
                GROUP BY bucket, device_id
                ORDER BY bucket ASC, device_id ASC
            """, [bucket_size, device_ids, start_time, end_time])

            results = cursor.fetchall()

        # Format the results
        data = [
            {
                "timestamp": row[0],
                "device_id": row[1],
                "avg_value": row[2],
            }
            for row in results
        ]
        return Response(data)

    def filter_queryset(self, queryset):
        """
        Override filter_queryset to bypass filtering for custom actions.
        """
        if self.action == 'aggregated_readings':
            # Return the original queryset without applying filters
            return queryset
        return super().filter_queryset(queryset)

    def perform_create(self, serializer):
        # Save the sensor reading to the DB
        sensor_reading = serializer.save()

        # Send the new sensor reading to WebSocket
        broadcast_to_websocket(sensor_reading)

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    # You can customize the token response here if needed.
    pass

def broadcast_to_websocket(sensor_reading):
    channel_layer = get_channel_layer()
    room_group_name = f"sensor_readings_{sensor_reading.device.device_id}"

    # Dynamically construct the data dictionary based on available sensor readings
    data = {
        "device_id": sensor_reading.device.device_id,
        "timestamp": sensor_reading.timestamp.isoformat(),
    }

    # Add sensor readings dynamically if they are not None
    if sensor_reading.temperature is not None:
        data["temperature"] = sensor_reading.temperature
    if sensor_reading.humidity is not None:
        data["humidity"] = sensor_reading.humidity
    if sensor_reading.light is not None:
        data["light"] = sensor_reading.light
    if sensor_reading.air_quality is not None:
        data["air_quality"] = sensor_reading.air_quality
    if sensor_reading.soil_moisture is not None:
        data["soil_moisture"] = sensor_reading.soil_moisture

    # Broadcast the data to the WebSocket room group
    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            "type": "send_sensor_data",
            "data": data,
        }
    )