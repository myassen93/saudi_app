from django.contrib.auth import get_user_model
from django.views.generic import TemplateView
from django_otp import user_has_device

from accounts.mixins import TwoFactorRequiredMixin

from .services import get_dashboard_stats

User = get_user_model()


class DashboardView(TwoFactorRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard.html"
    login_url = "login"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(get_dashboard_stats())
        context["is_admin"] = self.request.user.is_staff
        context["otp_enabled"] = user_has_device(self.request.user)
        if self.request.user.is_staff:
            context["users"] = User.objects.all().order_by("-date_joined")
        return context
