from django.contrib.auth import views as auth_views
from django.urls import path

from accounts.views import OTPDisableView, OTPSetupView, OTPVerifyView

from .forms import LoginForm
from .views import DashboardView

urlpatterns = [
    path(
        "login/",
        auth_views.LoginView.as_view(
            template_name="dashboard/login.html",
            authentication_form=LoginForm,
        ),
        name="login",
    ),
    path("otp/verify/", OTPVerifyView.as_view(), name="otp-verify"),
    path("otp/setup/", OTPSetupView.as_view(), name="otp-setup"),
    path("otp/disable/", OTPDisableView.as_view(), name="otp-disable"),
    path(
        "logout/",
        auth_views.LogoutView.as_view(next_page="login"),
        name="logout",
    ),
    path("", DashboardView.as_view(), name="dashboard"),
]
