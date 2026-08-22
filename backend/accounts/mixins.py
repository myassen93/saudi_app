from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.urls import reverse
from django_otp import user_has_device


class TwoFactorRequiredMixin(LoginRequiredMixin):
    """Like LoginRequiredMixin, but also sends users with 2FA enabled through OTP verification first."""

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated and user_has_device(request.user) and not request.user.is_verified():
            return redirect(f"{reverse('otp-verify')}?next={request.get_full_path()}")
        return super().dispatch(request, *args, **kwargs)
