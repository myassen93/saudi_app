from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with a demo admin user and a demo normal user."

    def add_arguments(self, parser):
        parser.add_argument("--admin-username", default="admin", help="Admin username (default: admin)")
        parser.add_argument(
            "--admin-password", default="Admin12345", help="Admin password (default: Admin12345)"
        )
        parser.add_argument("--user-username", default="user", help="Normal user username (default: user)")
        parser.add_argument(
            "--user-password", default="User12345", help="Normal user password (default: User12345)"
        )

    def handle(self, *args, **options):
        self._seed_user(
            username=options["admin_username"],
            password=options["admin_password"],
            gender=User.Gender.MALE,
            is_staff=True,
            is_superuser=True,
        )
        self._seed_user(
            username=options["user_username"],
            password=options["user_password"],
            gender=User.Gender.FEMALE,
            is_staff=False,
            is_superuser=False,
        )

    def _seed_user(self, *, username, password, gender, is_staff, is_superuser):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"gender": gender, "is_staff": is_staff, "is_superuser": is_superuser},
        )
        role = "admin" if is_staff else "normal"
        if not created:
            self.stdout.write(self.style.WARNING(f"{role} user '{username}' already exists, skipping"))
            return
        user.set_password(password)
        user.save()
        self.stdout.write(
            self.style.SUCCESS(f"Created {role} user '{username}' (password: {password})")
        )
