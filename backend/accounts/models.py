from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Gender(models.TextChoices):
        MALE = "male", _("ذكر")
        FEMALE = "female", _("أنثى")

    gender = models.CharField(
        _("الجنس"),
        max_length=10,
        choices=Gender.choices,
        blank=True,
    )

    def __str__(self):
        return self.username
