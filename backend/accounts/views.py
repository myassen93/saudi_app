from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.utils.http import url_has_allowed_host_and_scheme
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.generic import CreateView, DeleteView, UpdateView
from django_otp import login as otp_login
from django_otp import match_token, user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice

from .forms import OTPTokenForm, UserCreateForm, UserUpdateForm
from .mixins import TwoFactorRequiredMixin
from .otp_utils import qr_data_uri

User = get_user_model()


class StaffRequiredMixin(TwoFactorRequiredMixin, UserPassesTestMixin):
    login_url = "login"

    def test_func(self):
        return self.request.user.is_staff


class UserCreateView(StaffRequiredMixin, CreateView):
    model = User
    form_class = UserCreateForm
    template_name = "accounts/user_form.html"
    success_url = reverse_lazy("dashboard")

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request, _("تم إنشاء المستخدم %(username)s بنجاح") % {"username": self.object.username}
        )
        return response


class UserUpdateView(StaffRequiredMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = "accounts/user_form.html"
    success_url = reverse_lazy("dashboard")

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request, _("تم تعديل المستخدم %(username)s بنجاح") % {"username": self.object.username}
        )
        return response


class UserDeleteView(StaffRequiredMixin, DeleteView):
    model = User
    template_name = "accounts/user_confirm_delete.html"
    success_url = reverse_lazy("dashboard")

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object == request.user:
            messages.error(request, _("لا يمكنك حذف حسابك الخاص"))
            return redirect("dashboard")
        username = self.object.username
        response = super().post(request, *args, **kwargs)
        messages.success(request, _("تم حذف المستخدم %(username)s") % {"username": username})
        return response


def _safe_next_url(request, default="dashboard"):
    next_url = request.GET.get("next") or request.POST.get("next")
    if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        return next_url
    return reverse(default)


class OTPVerifyView(LoginRequiredMixin, View):
    """Second login step for users with a confirmed OTP device (TOTP code or a static backup code)."""

    login_url = "login"
    template_name = "accounts/otp_verify.html"

    def get(self, request):
        if not user_has_device(request.user) or request.user.is_verified():
            return redirect(_safe_next_url(request))
        form = OTPTokenForm(initial={"next": _safe_next_url(request)}, submit_label=_("تحقق"))
        return render(request, self.template_name, {"form": form})

    def post(self, request):
        if not user_has_device(request.user) or request.user.is_verified():
            return redirect(_safe_next_url(request))
        form = OTPTokenForm(request.POST, submit_label=_("تحقق"))
        if form.is_valid():
            device = match_token(request.user, form.cleaned_data["otp_token"])
            if device is not None:
                otp_login(request, device)
                messages.success(request, _("تم التحقق بنجاح"))
                return redirect(_safe_next_url(request))
            form.add_error("otp_token", _("رمز التحقق غير صحيح"))
        return render(request, self.template_name, {"form": form})


class OTPSetupView(TwoFactorRequiredMixin, View):
    """Lets the current user scan a QR code and confirm a TOTP device to turn 2FA on."""

    login_url = "login"
    template_name = "accounts/otp_setup.html"
    device_name = "default"

    def _pending_device(self, request):
        device, _created = TOTPDevice.objects.get_or_create(
            user=request.user, name=self.device_name, confirmed=False
        )
        return device

    def get(self, request):
        if user_has_device(request.user):
            messages.info(request, _("التحقق بخطوتين مُفعّل بالفعل على حسابك"))
            return redirect("dashboard")
        device = self._pending_device(request)
        form = OTPTokenForm(submit_label=_("تفعيل"))
        context = {"form": form, "qr_data_uri": qr_data_uri(device), "secret_key": device.key}
        return render(request, self.template_name, context)

    def post(self, request):
        if user_has_device(request.user):
            return redirect("dashboard")
        device = self._pending_device(request)
        form = OTPTokenForm(request.POST, submit_label=_("تفعيل"))
        if form.is_valid() and device.verify_token(form.cleaned_data["otp_token"]):
            device.confirmed = True
            device.save()
            otp_login(request, device)
            messages.success(request, _("تم تفعيل التحقق بخطوتين بنجاح"))
            return redirect("dashboard")
        form.add_error("otp_token", _("رمز التحقق غير صحيح، حاول مرة أخرى"))
        context = {"form": form, "qr_data_uri": qr_data_uri(device), "secret_key": device.key}
        return render(request, self.template_name, context)


class OTPDisableView(TwoFactorRequiredMixin, View):
    login_url = "login"

    def post(self, request):
        TOTPDevice.objects.filter(user=request.user).delete()
        messages.success(request, _("تم إيقاف التحقق بخطوتين"))
        return redirect("dashboard")
