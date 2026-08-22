import base64
import io

import qrcode
from django_otp import match_token, user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    LoginResponseSerializer,
    TwoFactorSetupSerializer,
    TwoFactorStatusSerializer,
    TwoFactorTokenSerializer,
    UserSerializer,
)


@extend_schema_view(
    list=extend_schema(tags=["Users"], summary="عرض كل المستخدمين"),
    retrieve=extend_schema(tags=["Users"], summary="عرض مستخدم"),
    create=extend_schema(tags=["Users"], summary="إنشاء مستخدم جديد"),
    update=extend_schema(tags=["Users"], summary="تعديل مستخدم"),
    partial_update=extend_schema(tags=["Users"], summary="تعديل جزئي لمستخدم"),
    destroy=extend_schema(tags=["Users"], summary="حذف مستخدم"),
)
class UserViewSet(viewsets.ModelViewSet):
    """Full CRUD over users (username, password, gender, admin role). Admin-only (is_staff), same as the admin panel."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


@extend_schema(
    tags=["Auth"],
    summary="تسجيل الدخول",
    request=AuthTokenSerializer,
    responses={200: LoginResponseSerializer, 401: LoginResponseSerializer},
)
class LoginAPIView(ObtainAuthToken):
    """POST username/password (+ otp_token if 2FA is enabled), get back an auth token.

    If the account has 2FA confirmed and no valid otp_token was sent, responds 401 with
    {"otp_required": true} instead of a token, so the caller can prompt for a code and
    resubmit the same request with otp_token included.
    """

    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        if user_has_device(user):
            otp_token = request.data.get("otp_token", "")
            if not otp_token or match_token(user, otp_token) is None:
                return Response({"otp_required": True}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username, "gender": user.gender})


@extend_schema(
    tags=["Auth"],
    summary="تسجيل الخروج",
    request=None,
    responses={204: OpenApiResponse(description="تم تسجيل الخروج بنجاح")},
)
class LogoutAPIView(APIView):
    """POST (authenticated) to invalidate the caller's current auth token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _qr_data_uri(device):
    image = qrcode.make(device.config_url)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


@extend_schema(tags=["Auth"], summary="حالة التحقق بخطوتين", responses={200: TwoFactorStatusSerializer})
class TwoFactorStatusAPIView(APIView):
    """GET (authenticated): whether the caller has a confirmed TOTP device."""

    def get(self, request):
        return Response({"enabled": user_has_device(request.user)})


@extend_schema(tags=["Auth"], summary="بدء تفعيل التحقق بخطوتين", responses={200: TwoFactorSetupSerializer})
class TwoFactorSetupAPIView(APIView):
    """POST (authenticated): create (or reuse) a pending TOTP device and return its QR code + secret."""

    def post(self, request):
        if user_has_device(request.user):
            return Response({"detail": "التحقق بخطوتين مُفعّل بالفعل"}, status=status.HTTP_400_BAD_REQUEST)
        device, _created = TOTPDevice.objects.get_or_create(user=request.user, name="default", confirmed=False)
        # Authenticator apps expect the base32 form embedded in the QR's otpauth:// URI for
        # manual entry, not device.key (hex) — typing the hex string would never verify.
        secret = base64.b32encode(device.bin_key).decode("ascii")
        return Response({"qr_code": _qr_data_uri(device), "secret": secret})


@extend_schema(
    tags=["Auth"],
    summary="تأكيد تفعيل التحقق بخطوتين",
    request=TwoFactorTokenSerializer,
    responses={200: TwoFactorStatusSerializer},
)
class TwoFactorConfirmAPIView(APIView):
    """POST (authenticated) {otp_token}: confirm the pending device, turning 2FA on."""

    def post(self, request):
        serializer = TwoFactorTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device = TOTPDevice.objects.filter(user=request.user, confirmed=False).first()
        if device is None or not device.verify_token(serializer.validated_data["otp_token"]):
            return Response({"detail": "رمز التحقق غير صحيح"}, status=status.HTTP_400_BAD_REQUEST)
        device.confirmed = True
        device.save()
        return Response({"enabled": True})


@extend_schema(tags=["Auth"], summary="إيقاف التحقق بخطوتين", request=None, responses={200: TwoFactorStatusSerializer})
class TwoFactorDisableAPIView(APIView):
    """POST (authenticated): delete the caller's TOTP device(s), turning 2FA off."""

    def post(self, request):
        TOTPDevice.objects.filter(user=request.user).delete()
        return Response({"enabled": False})
