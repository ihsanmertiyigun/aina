"""Demo veri üretir:  python manage.py seed_demo"""
import math
import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from monitoring.models import Alert, Device, Site, TrafficSample

SITES = [("Ankara Genel Merkez", "Ankara", "ANK"), ("İstanbul Veri Merkezi", "İstanbul", "IST"),
         ("İzmir Bölge", "İzmir", "IZM"), ("Bursa Şube", "Bursa", "BUR")]
TYPES = [("router", "Cisco", "ISR 4451"), ("switch", "Cisco", "Catalyst 9300"),
         ("firewall", "Fortinet", "FortiGate 200F"), ("server", "Dell", "PowerEdge R750"),
         ("ap", "Aruba", "AP-515")]
MESSAGES = {
    "critical": ["Cihaz erişilemiyor (ICMP timeout)", "BGP oturumu düştü", "Arayüz Gi0/1 down"],
    "major": ["CPU kullanımı %90 üzerinde", "Paket kaybı %5 üzerinde"],
    "minor": ["Bellek kullanımı %80 üzerinde", "Yüksek gecikme (>120 ms)"],
    "info": ["Konfigürasyon değişikliği algılandı", "Cihaz yeniden başlatıldı"],
}


class Command(BaseCommand):
    help = "Dashboard için demo lokasyon, cihaz, alarm ve trafik verisi oluşturur."

    def add_arguments(self, parser):
        parser.add_argument("--devices", type=int, default=24)

    def handle(self, *args, **opts):
        random.seed(42)
        TrafficSample.objects.all().delete()
        Alert.objects.all().delete()
        Device.objects.all().delete()
        Site.objects.all().delete()

        sites = [Site.objects.create(name=n, city=c) for n, c, _ in SITES]
        codes = {s.name: code for (_, _, code), s in zip(SITES, sites)}
        now = timezone.now()
        devices = []
        for i in range(opts["devices"]):
            dtype, vendor, model = TYPES[i % len(TYPES)]
            site = sites[i % len(sites)]
            status = random.choices(["up", "warning", "down"], weights=[80, 14, 6])[0]
            devices.append(Device.objects.create(
                hostname=f"{codes[site.name]}-{dtype.upper()}-{i + 1:02d}",
                ip_address=f"10.{10 + sites.index(site)}.{i // 10}.{(i % 250) + 1}",
                device_type=dtype, vendor=vendor, model=model, site=site, status=status,
                cpu_usage=round(random.uniform(60, 97) if status == "warning" else random.uniform(5, 55), 1),
                memory_usage=round(random.uniform(30, 85), 1),
                uptime_seconds=0 if status == "down" else random.randint(3600, 90 * 86400),
                last_seen=now - timedelta(minutes=random.randint(15, 300) if status == "down" else 1),
            ))

        samples = []
        for d in devices:
            base = random.uniform(20, 400)
            for h in range(24 * 12):  # son 24 saat, 5 dk aralık
                ts = now - timedelta(minutes=5 * h)
                wave = 0.6 + 0.4 * math.sin((ts.hour - 6) / 24 * 2 * math.pi)
                samples.append(TrafficSample(
                    device=d, timestamp=ts,
                    inbound_mbps=round(base * wave * random.uniform(0.85, 1.15), 2),
                    outbound_mbps=round(base * 0.45 * wave * random.uniform(0.85, 1.15), 2),
                    latency_ms=round(random.uniform(2, 25) + (60 if d.status == "warning" else 0), 2),
                    packet_loss=round(random.uniform(0, 0.5), 2),
                ))
        TrafficSample.objects.bulk_create(samples, batch_size=2000)

        for _ in range(40):
            sev = random.choices(list(MESSAGES), weights=[10, 20, 35, 35])[0]
            Alert.objects.create(
                device=random.choice(devices), severity=sev, message=random.choice(MESSAGES[sev]),
                created_at=now - timedelta(minutes=random.randint(1, 72 * 60)),
                acknowledged=random.random() < 0.3, resolved=random.random() < 0.35,
            )

        User = get_user_model()
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@aina.local", "Admin123!",
                                          first_name="Sistem", last_name="Yöneticisi")
            self.stdout.write("Kullanıcı oluşturuldu: admin / Admin123!")

        self.stdout.write(self.style.SUCCESS(
            f"{len(sites)} lokasyon, {len(devices)} cihaz, {len(samples)} ölçüm, 40 alarm oluşturuldu."))
