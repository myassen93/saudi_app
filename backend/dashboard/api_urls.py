from django.urls import path

from .api_views import DashboardStatsAPIView

urlpatterns = [
    path("dashboard/", DashboardStatsAPIView.as_view(), name="api-dashboard"),
]
