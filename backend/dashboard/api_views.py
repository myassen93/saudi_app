from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import DashboardStatsSerializer
from .services import get_dashboard_stats


@extend_schema(
    tags=["Dashboard"],
    summary="إحصائيات لوحة التحكم",
    responses={200: DashboardStatsSerializer},
)
class DashboardStatsAPIView(APIView):
    """GET (authenticated) totals: total registered users, and counts by gender."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = DashboardStatsSerializer(get_dashboard_stats())
        return Response(serializer.data)
