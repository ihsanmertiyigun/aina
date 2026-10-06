from django.db import models


class Site(models.Model):
    name = models.CharField("Lokasyon", max_length=100, unique=True)
    city = models.CharField("Şehir", max_length=100, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Lokasyon"
        verbose_name_plural = "Lokasyonlar"

    def __str__(self):
        return self.name


class Device(models.Model):
    class Type(models.TextChoices):
        ROUTER = "router", "Router"
        SWITCH = "switch", "Switch"
        FIREWALL = "firewall", "Firewall"
        SERVER = "server", "Sunucu"
        AP = "ap", "Access Point"

    class Status(models.TextChoices):
        UP = "up", "Çalışıyor"
        WARNING = "warning", "Uyarı"
        DOWN = "down", "Erişilemiyor"

    hostname = models.CharField(max_length=120, unique=True)
    ip_address = models.GenericIPAddressField()
    device_type = models.CharField(max_length=20, choices=Type.choices)
    vendor = models.CharField(max_length=60, blank=True)
    model = models.CharField(max_length=60, blank=True)
    site = models.ForeignKey(Site, on_delete=models.SET_NULL, null=True, related_name="devices")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UP)
    cpu_usage = models.FloatField(default=0)
    memory_usage = models.FloatField(default=0)
    uptime_seconds = models.BigIntegerField(default=0)
    last_seen = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["hostname"]
        verbose_name = "Cihaz"
        verbose_name_plural = "Cihazlar"

    def __str__(self):
        return self.hostname


class Alert(models.Model):
    class Severity(models.TextChoices):
        CRITICAL = "critical", "Kritik"
        MAJOR = "major", "Yüksek"
        MINOR = "minor", "Düşük"
        INFO = "info", "Bilgi"

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="alerts")
    severity = models.CharField(max_length=10, choices=Severity.choices)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    acknowledged = models.BooleanField(default=False)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Alarm"
        verbose_name_plural = "Alarmlar"


class TrafficSample(models.Model):
    """Cihaz bazlı zaman serisi trafik/gecikme ölçümü (Mbps, ms)."""
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="samples")
    timestamp = models.DateTimeField(db_index=True)
    inbound_mbps = models.FloatField()
    outbound_mbps = models.FloatField()
    latency_ms = models.FloatField()
    packet_loss = models.FloatField(default=0)

    class Meta:
        ordering = ["timestamp"]
        indexes = [models.Index(fields=["device", "timestamp"])]
