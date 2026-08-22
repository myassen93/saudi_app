from django.urls import path

from .views import UserCreateView, UserDeleteView, UserUpdateView

urlpatterns = [
    path("add/", UserCreateView.as_view(), name="user-add"),
    path("<int:pk>/edit/", UserUpdateView.as_view(), name="user-edit"),
    path("<int:pk>/delete/", UserDeleteView.as_view(), name="user-delete"),
]
