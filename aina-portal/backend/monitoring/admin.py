from django.contrib import admin

from .models import Alert, Device, Site, TrafficSample


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ("name", "city")


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("hostname", "ip_address", "device_type", "site", "status", "cpu_usage", "memory_usage")
    list_filter = ("status", "device_type", "site")
    search_fields = ("hostname", "ip_address")


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("created_at", "device", "severity", "message", "acknowledged", "resolved")
    list_filter = ("severity", "acknowledged", "resolved")


@admin.register(TrafficSample)
class TrafficSampleAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "device", "inbound_mbps", "outbound_mbps", "latency_ms")
    list_filter = ("device",)
