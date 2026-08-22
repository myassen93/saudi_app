from django.contrib.auth import get_user_model

User = get_user_model()


def get_dashboard_stats():
    """Shared by the HTML dashboard view and the /api/dashboard/ endpoint."""
    return {
        "total_users": User.objects.count(),
        "gender_counts": [
            {"gender": value, "label": label, "count": User.objects.filter(gender=value).count()}
            for value, label in User.Gender.choices
        ],
    }
