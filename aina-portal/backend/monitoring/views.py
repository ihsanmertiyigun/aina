from datetime import timedelta

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncHour
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Alert, Device, Site, TrafficSample
from .serializers import AlertSerializer, DeviceSerializer, SiteSerializer


class SiteViewSet(viewsets.ModelViewSet):
    serializer_class = SiteSerializer

    def get_queryset(self):
        return Site.objects.annotate(device_count=Count("devices"))


class DeviceViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceSerializer

    def get_queryset(self):
        qs = Device.objects.select_related("site")
        p = self.request.query_params
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("type"):
            qs = qs.filter(device_type=p["type"])
        if p.get("site"):
            qs = qs.filter(site_id=p["site"])
        if p.get("search"):
            qs = qs.filter(Q(hostname__icontains=p["search"]) | Q(ip_address__icontains=p["search"]))
        return qs

    @action(detail=True, methods=["get"])
    def traffic(self, request, pk=None):
        hours = int(request.query_params.get("hours", 24))
        since = timezone.now() - timedelta(hours=hours)
        rows = (TrafficSample.objects.filter(device_id=pk, timestamp__gte=since)
                .values("timestamp", "inbound_mbps", "outbound_mbps", "latency_ms", "packet_loss"))
        return Response(list(rows))


class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer

    def get_queryset(self):
        qs = Alert.objects.select_related("device")
        p = self.request.query_params
        if p.get("severity"):
            qs = qs.filter(severity=p["severity"])
        if p.get("open") == "1":
            qs = qs.filter(resolved=False)
        return qs

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        alert = self.get_object()
        alert.acknowledged = True
        alert.save(update_fields=["acknowledged"])
        return Response(AlertSerializer(alert).data)


@api_view(["GET"])
def dashboard_summary(request):
    """Ana dashboard için KPI, dağılım ve zaman serisi verisi."""
    now = timezone.now()
    since = now - timedelta(hours=24)

    status_counts = dict(Device.objects.values_list("status").annotate(c=Count("id")))
    total = sum(status_counts.values())
    open_alerts = Alert.objects.filter(resolved=False)

    traffic = (TrafficSample.objects.filter(timestamp__gte=since)
               .annotate(hour=TruncHour("timestamp")).values("hour")
               .annotate(inbound=Sum("inbound_mbps"), outbound=Sum("outbound_mbps"),
                         latency=Avg("latency_ms"), n=Count("timestamp", distinct=True))
               .order_by("hour"))

    by_type = list(Device.objects.values("device_type").annotate(count=Count("id")).order_by("-count"))
    by_site = list(Site.objects.annotate(
        up=Count("devices", filter=Q(devices__status="up")),
        warning=Count("devices", filter=Q(devices__status="warning")),
        down=Count("devices", filter=Q(devices__status="down")),
    ).values("name", "up", "warning", "down"))

    top_cpu = DeviceSerializer(Device.objects.select_related("site").order_by("-cpu_usage")[:5], many=True).data
    recent_alerts = AlertSerializer(open_alerts.select_related("device")[:8], many=True).data
    avg = Device.objects.aggregate(cpu=Avg("cpu_usage"), mem=Avg("memory_usage"))

    return Response({
        "kpis": {
            "total_devices": total,
            "up": status_counts.get("up", 0),
            "warning": status_counts.get("warning", 0),
            "down": status_counts.get("down", 0),
            "availability": round(100 * status_counts.get("up", 0) / total, 2) if total else 0,
            "open_alerts": open_alerts.count(),
            "critical_alerts": open_alerts.filter(severity="critical").count(),
            "avg_cpu": round(avg["cpu"] or 0, 1),
            "avg_memory": round(avg["mem"] or 0, 1),
        },
        "traffic": [
            {"time": r["hour"].isoformat(), "inbound": round(r["inbound"] / r["n"], 1),
             "outbound": round(r["outbound"] / r["n"], 1), "latency": round(r["latency"], 1)}
            for r in traffic
        ],
        "by_type": by_type,
        "by_site": by_site,
        "top_cpu": top_cpu,
        "recent_alerts": recent_alerts,
    })
