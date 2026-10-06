from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AlertViewSet, DeviceViewSet, SiteViewSet, dashboard_summary

router = DefaultRouter()
router.register("sites", SiteViewSet, basename="site")
router.register("devices", DeviceViewSet, basename="device")
router.register("alerts", AlertViewSet, basename="alert")

urlpatterns = [
    path("dashboard/summary/", dashboard_summary, name="dashboard-summary"),
    path("", include(router.urls)),
]
