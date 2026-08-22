from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import (
    LoginAPIView,
    LogoutAPIView,
    TwoFactorConfirmAPIView,
    TwoFactorDisableAPIView,
    TwoFactorSetupAPIView,
    TwoFactorStatusAPIView,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="api-user")

urlpatterns = [
    path("auth/login/", LoginAPIView.as_view(), name="api-login"),
    path("auth/logout/", LogoutAPIView.as_view(), name="api-logout"),
    path("auth/2fa/status/", TwoFactorStatusAPIView.as_view(), name="api-2fa-status"),
    path("auth/2fa/setup/", TwoFactorSetupAPIView.as_view(), name="api-2fa-setup"),
    path("auth/2fa/confirm/", TwoFactorConfirmAPIView.as_view(), name="api-2fa-confirm"),
    path("auth/2fa/disable/", TwoFactorDisableAPIView.as_view(), name="api-2fa-disable"),
    path("", include(router.urls)),
]
