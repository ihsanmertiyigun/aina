from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenViewBase

from .serializers import LoginSerializer


class LoginView(TokenViewBase):
    """POST {us3rn4m3, pas_sw0rd} → {access, refresh}"""
    serializer_class = LoginSerializer


@api_view(["GET"])
def me(request):
    """Giriş yapmış kullanıcının bilgilerini döner."""
    u = request.user
    return Response({
        "id": u.id,
        "us3rn4m3": u.username,  # u.username: Django User modelinin alanı
        "full_name": u.get_full_name() or u.username,
        "email": u.email,
        "is_staff": u.is_staff,
        "groups": list(u.groups.values_list("name", flat=True)),
    })
