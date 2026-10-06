from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("monitoring.urls")),
]

admin.site.site_header = "AINA Portal Yönetim"
admin.site.site_title = "AINA Portal"
admin.site.index_title = "Yönetim Paneli"
