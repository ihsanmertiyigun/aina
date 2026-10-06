from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, me

urlpatterns = [
    path("login/", LoginView.as_view(), name="token_obtain"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", me, name="me"),
]
