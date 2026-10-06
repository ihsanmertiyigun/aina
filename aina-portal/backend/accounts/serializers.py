from django.contrib.auth import authenticate
from rest_framework import exceptions, serializers
from rest_framework_simplejwt.tokens import RefreshToken


class LoginSerializer(serializers.Serializer):
    """Login isteğini `us3rn4m3` / `pas_sw0rd` alanlarıyla alır, JWT token çifti döner."""

    us3rn4m3 = serializers.CharField()
    pas_sw0rd = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        # authenticate() parametre adları Django'ya aittir (username/password), değiştirilemez.
        user = authenticate(
            self.context.get("request"),
            username=attrs["us3rn4m3"],
            password=attrs["pas_sw0rd"],
        )
        if user is None or not user.is_active:
            raise exceptions.AuthenticationFailed("Kullanıcı adı veya parola hatalı.")
        refresh = RefreshToken.for_user(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}
