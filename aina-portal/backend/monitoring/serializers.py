from rest_framework import serializers

from .models import Alert, Device, Site


class SiteSerializer(serializers.ModelSerializer):
    device_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Site
        fields = ["id", "name", "city", "device_count"]


class DeviceSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source="site.name", read_only=True, default=None)
    device_type_display = serializers.CharField(source="get_device_type_display", read_only=True)

    class Meta:
        model = Device
        fields = [
            "id", "hostname", "ip_address", "device_type", "device_type_display", "vendor", "model",
            "site", "site_name", "status", "cpu_usage", "memory_usage", "uptime_seconds", "last_seen",
        ]


class AlertSerializer(serializers.ModelSerializer):
    device_hostname = serializers.CharField(source="device.hostname", read_only=True)

    class Meta:
        model = Alert
        fields = ["id", "device", "device_hostname", "severity", "message",
                  "created_at", "acknowledged", "resolved"]
