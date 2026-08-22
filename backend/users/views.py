from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer


def _set_token_cookies(response, user):
    """Generate JWT tokens and set them as httpOnly cookies on the response."""
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="None" if not settings.DEBUG else "Lax",
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="None" if not settings.DEBUG else "Lax",
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path="/",
    )
    return response


def _clear_token_cookies(response):
    """Remove JWT cookies from the response."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new user and return JWT cookies."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        user_data = UserSerializer(user).data
        response = Response(user_data, status=status.HTTP_201_CREATED)
        return _set_token_cookies(response, user)


class LoginView(APIView):
    """POST /api/auth/login/ — authenticate with email & password, return JWT cookies."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {"detail": "Email ve şifre gereklidir."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Geçersiz email veya şifre."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Geçersiz email veya şifre."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "Bu hesap devre dışı bırakılmış."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_data = UserSerializer(user).data
        response = Response(user_data, status=status.HTTP_200_OK)
        return _set_token_cookies(response, user)


class RefreshView(APIView):
    """POST /api/auth/refresh/ — refresh access token using refresh cookie."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        raw_refresh = request.COOKIES.get("refresh_token")
        if not raw_refresh:
            return Response(
                {"detail": "Refresh token bulunamadı."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(raw_refresh)
            access_token = str(refresh.access_token)
        except TokenError:
            response = Response(
                {"detail": "Geçersiz veya süresi dolmuş refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return _clear_token_cookies(response)

        response = Response({"detail": "Token yenilendi."}, status=status.HTTP_200_OK)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            path="/",
        )
        return response


class LogoutView(APIView):
    """POST /api/auth/logout/ — clear JWT cookies and blacklist refresh token."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        response = Response(
            {"detail": "Çıkış yapıldı."},
            status=status.HTTP_200_OK,
        )
        # Try to blacklist the refresh token (best effort)
        raw_refresh = request.COOKIES.get("refresh_token")
        if raw_refresh:
            try:
                token = RefreshToken(raw_refresh)
                token.blacklist()
            except Exception:
                pass  # Token may be expired or invalid, ignore

        return _clear_token_cookies(response)


class MeView(APIView):
    """GET/PATCH /api/auth/me/ — return or update current user profile."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



class ChangePasswordView(APIView):
    """PUT /api/auth/change-password/ — change the authenticated user's password."""

    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": ["Mevcut şifreniz yanlış."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"detail": "Şifreniz başarıyla değiştirildi."}, status=status.HTTP_200_OK
        )
