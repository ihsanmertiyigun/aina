from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def me(request):
    """Giriş yapmış kullanıcının bilgilerini döner."""
    u = request.user
    return Response({
        "id": u.id,
        "username": u.username,
        "full_name": u.get_full_name() or u.username,
        "email": u.email,
        "is_staff": u.is_staff,
        "groups": list(u.groups.values_list("name", flat=True)),
    })
